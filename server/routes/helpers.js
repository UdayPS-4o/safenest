const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, workHistory, societies } = require('../db').schema;
const { eq, and, sql } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Apply auth to all helper routes
router.use(authMiddleware);

/**
 * GET /api/helpers
 * Search helpers in the caller's society.
 * Query: ?search=<name or phone>
 */
router.get('/', async (req, res) => {
  const { search } = req.query;
  const societyId = req.user.societyId;

  try {
    const conditions = [eq(users.role, 'HELPER'), eq(users.societyId, societyId)];
    let rows = db.select().from(users).where(and(...conditions)).all();

    // Filter by search term if provided
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (h) =>
          h.fullName?.toLowerCase().includes(term) ||
          h.phoneNumber?.includes(term)
      );
    }

    return res.json({ success: true, helpers: rows });
  } catch (error) {
    console.error('[Helpers] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/helpers/:id
 * Get a single helper's profile with their work history
 */
router.get('/:id', async (req, res) => {
  const helperId = parseInt(req.params.id, 10);

  try {
    const helperRows = db.select().from(users).where(eq(users.id, helperId)).all();
    const helper = helperRows[0];

    if (!helper) {
      return res.status(404).json({ success: false, message: 'Helper not found' });
    }

    // Fetch work history with resident and society info joined
    const history = db
      .select({
        id: workHistory.id,
        jobTitle: workHistory.jobTitle,
        startDate: workHistory.startDate,
        endDate: workHistory.endDate,
        status: workHistory.status,
        societyName: societies.name,
        residentName: users.fullName,
        flatNumber: users.flatNumber,
      })
      .from(workHistory)
      .leftJoin(societies, eq(workHistory.societyId, societies.id))
      .leftJoin(users, eq(workHistory.residentId, users.id))
      .where(eq(workHistory.helperId, helperId))
      .all();

    return res.json({ success: true, helper, workHistory: history });
  } catch (error) {
    console.error('[Helper Detail] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/helpers/:id/work-history
 * Get full work history for a helper (residents only)
 */
router.get('/:id/work-history', requireRole('RESIDENT', 'ADMIN'), async (req, res) => {
  const helperId = parseInt(req.params.id, 10);
  try {
    const history = db
      .select({
        id: workHistory.id,
        jobTitle: workHistory.jobTitle,
        startDate: workHistory.startDate,
        endDate: workHistory.endDate,
        status: workHistory.status,
        societyName: societies.name,
        residentName: users.fullName,
        flatNumber: users.flatNumber,
      })
      .from(workHistory)
      .leftJoin(societies, eq(workHistory.societyId, societies.id))
      .leftJoin(users, eq(workHistory.residentId, users.id))
      .where(eq(workHistory.helperId, helperId))
      .all();
    return res.json({ success: true, workHistory: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
