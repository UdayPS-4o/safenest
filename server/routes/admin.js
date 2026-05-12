const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, societies, workHistory, incidentsAndAlerts } = require('../db').schema;
const { eq, and, count } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('ADMIN'));

/**
 * GET /api/admin/overview
 * Society overview metrics
 */
router.get('/overview', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const [guardCount] = db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'GUARD'), eq(users.societyId, societyId))).all();

    const [helperCount] = db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId))).all();

    const [residentCount] = db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'RESIDENT'), eq(users.societyId, societyId))).all();

    const [openAlerts] = db
      .select({ value: count() })
      .from(incidentsAndAlerts)
      .where(and(eq(incidentsAndAlerts.societyId, societyId), eq(incidentsAndAlerts.status, 'OPEN'))).all();

    const [pendingApprovals] = db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING'))).all();

    const metrics = {
      guards: guardCount?.value ?? 0,
      helpers: helperCount?.value ?? 0,
      residents: residentCount?.value ?? 0,
      openAlerts: openAlerts?.value ?? 0,
      pendingApprovals: pendingApprovals?.value ?? 0,
    };

    // Get recent alerts for overview
    const recentAlerts = db.select().from(incidentsAndAlerts)
      .where(eq(incidentsAndAlerts.societyId, societyId))
      // SQLite limit and order by might require more complex setup, but basic works.
      .all().reverse().slice(0, 5);

    return res.json({ success: true, ...metrics, recentAlerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/pending-users
 * Users awaiting account approval
 */
router.get('/pending-users', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const pendingUsers = db
      .select()
      .from(users)
      .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING'))).all();
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
    db.update(users).set({ accountStatus: 'APPROVED' }).where(eq(users.id, userId)).run();
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
    db.update(users).set({ accountStatus: 'BANNED' }).where(eq(users.id, userId)).run();
    return res.json({ success: true, message: 'User banned' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/helpers
 * All helpers in the society for card management
 */
router.get('/helpers', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const helperList = db
      .select()
      .from(users)
      .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId))).all();
    return res.json({ success: true, helpers: helperList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/helpers/:id/revoke-card
 * Revoke/suspend a helper's QR card
 */
router.patch('/helpers/:id/revoke-card', async (req, res) => {
  const helperId = parseInt(req.params.id, 10);
  try {
    db.update(users).set({ accountStatus: 'BANNED', qrCardId: null }).where(eq(users.id, helperId)).run();
    return res.json({ success: true, message: 'Helper card revoked and account suspended' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/alerts
 * All open incidents
 */
router.get('/alerts', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    const alerts = db
      .select()
      .from(incidentsAndAlerts)
      .where(eq(incidentsAndAlerts.societyId, societyId)).all();
    return res.json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
