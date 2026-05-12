const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, societies, workHistory, incidentsAndAlerts } = require('../db').schema;
const { eq, and, count } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('ADMIN'));

/**
 * GET /api/admin/overview
 */
router.get('/overview', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const [guardCount] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'GUARD'), eq(users.societyId, societyId)));

    const [helperCount] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId)));

    const [residentCount] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'RESIDENT'), eq(users.societyId, societyId)));

    const [openAlerts] = await db
      .select({ value: count() })
      .from(incidentsAndAlerts)
      .where(and(eq(incidentsAndAlerts.societyId, societyId), eq(incidentsAndAlerts.status, 'OPEN')));

    const [pendingApprovals] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING')));

    const metrics = {
      guards: guardCount?.value ?? 0,
      helpers: helperCount?.value ?? 0,
      residents: residentCount?.value ?? 0,
      openAlerts: openAlerts?.value ?? 0,
      pendingApprovals: pendingApprovals?.value ?? 0,
    };

    const recentAlerts = await db
      .select()
      .from(incidentsAndAlerts)
      .where(eq(incidentsAndAlerts.societyId, societyId))
      .limit(5)
      .orderBy(incidentsAndAlerts.createdAt);

    return res.json({ success: true, ...metrics, recentAlerts });
  } catch (error) {
    console.error('[Admin Overview] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/pending-users
 */
router.get('/pending-users', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const pendingUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING')));
    return res.json({ success: true, users: pendingUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/users/:id/approve
 */
router.patch('/users/:id/approve', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    await db.update(users).set({ accountStatus: 'APPROVED' }).where(eq(users.id, userId));
    return res.json({ success: true, message: 'User approved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 */
router.patch('/users/:id/ban', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    await db.update(users).set({ accountStatus: 'BANNED' }).where(eq(users.id, userId));
    return res.json({ success: true, message: 'User banned' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/helpers
 */
router.get('/helpers', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const helperList = await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId)));
    return res.json({ success: true, helpers: helperList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/helpers/:id/revoke-card
 */
router.patch('/helpers/:id/revoke-card', async (req, res) => {
  const helperId = parseInt(req.params.id, 10);
  try {
    await db.update(users).set({ accountStatus: 'BANNED', qrCardId: null }).where(eq(users.id, helperId));
    return res.json({ success: true, message: 'Helper card revoked and account suspended' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/alerts
 */
router.get('/alerts', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const alerts = await db
      .select()
      .from(incidentsAndAlerts)
      .where(eq(incidentsAndAlerts.societyId, societyId))
      .orderBy(incidentsAndAlerts.createdAt);
    return res.json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
