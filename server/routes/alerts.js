const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { incidentsAndAlerts, users } = require('../db').schema;
const { eq } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * POST /api/alerts
 * Any authenticated user can file an alert / SOS
 * Body: { description, severity, targetUserId? }
 */
router.post('/', async (req, res) => {
  const { description, severity, targetUserId } = req.body;

  if (!description || !severity) {
    return res.status(400).json({ success: false, message: 'description and severity are required' });
  }

  const validSeverities = ['LOW', 'HIGH', 'SOS'];
  if (!validSeverities.includes(severity)) {
    return res.status(400).json({ success: false, message: `severity must be one of ${validSeverities.join(', ')}` });
  }

  try {
    db.insert(incidentsAndAlerts).values({
      reportedById: req.user.id,
      societyId: req.user.societyId,
      targetUserId: targetUserId || null,
      description,
      severity,
      status: 'OPEN',
    }).run();

    // If SOS, broadcast to all guards (placeholder — integrate socket.io or FCM here)
    if (severity === 'SOS') {
      console.log(`[SOS ALERT] From user ${req.user.id} in society ${req.user.societyId}`);
    }

    return res.status(201).json({ success: true, message: 'Alert filed successfully' });
  } catch (error) {
    console.error('[Alert] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
