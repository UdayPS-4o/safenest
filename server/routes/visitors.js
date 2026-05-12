const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { preApprovals, visitorLogs, users, societies } = require('../db').schema;
const { eq, and, isNull } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * POST /api/visitors/pre-approve
 * Resident creates a temporary QR code for a guest
 * Body: { visitorName, visitorPhone, validFrom, validUntil }
 */
router.post('/pre-approve', requireRole('RESIDENT'), async (req, res) => {
  const { visitorName, visitorPhone, validFrom, validUntil } = req.body;

  if (!visitorName || !visitorPhone || !validFrom || !validUntil) {
    return res.status(400).json({ success: false, message: 'visitorName, visitorPhone, validFrom, validUntil are required' });
  }

  const qrCodeValue = uuidv4();

  try {
    db.insert(preApprovals).values({
      residentId: req.user.id,
      societyId: req.user.societyId,
      visitorName,
      visitorPhone,
      qrCodeValue,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
    }).run();

    return res.status(201).json({
      success: true,
      message: 'Pre-approval created',
      qrCodeValue,
      validUntil,
    });
  } catch (error) {
    console.error('[PreApproval] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/visitors/pre-approvals
 * Resident gets their active pre-approvals
 */
router.get('/pre-approvals', requireRole('RESIDENT'), async (req, res) => {
  try {
    const activeApprovals = db
      .select()
      .from(preApprovals)
      .where(
        and(
          eq(preApprovals.residentId, req.user.id),
          eq(preApprovals.isUsed, false)
        )
      ).all();

    // Filter out expired ones in JS or leave as is
    const validApprovals = activeApprovals.filter(a => new Date() <= new Date(a.validUntil));
    
    return res.json({ success: true, preApprovals: validApprovals });
  } catch (error) {
    console.error('[GetPreApprovals] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * DELETE /api/visitors/pre-approvals/:id
 * Resident cancels a pre-approval
 */
router.delete('/pre-approvals/:id', requireRole('RESIDENT'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    db.delete(preApprovals)
      .where(and(eq(preApprovals.id, id), eq(preApprovals.residentId, req.user.id)))
      .run();
    return res.json({ success: true, message: 'Pre-approval cancelled' });
  } catch (error) {
    console.error('[DeletePreApproval] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/visitors/in-society
 * Guard gets live list of people currently inside the society
 */
router.get('/in-society', requireRole('GUARD', 'ADMIN', 'RESIDENT'), async (req, res) => {
  const societyId = req.user.societyId;

  try {
    const insideVisitors = db
      .select({
        logId: visitorLogs.id,
        entryTime: visitorLogs.entryTime,
        entryStatus: visitorLogs.entryStatus,
        destinationFlat: visitorLogs.destinationFlat,
        verificationMethod: visitorLogs.verificationMethod,
        visitorId: users.id,
        visitorName: users.fullName,
        visitorPhone: users.phoneNumber,
        visitorRole: users.role,
      })
      .from(visitorLogs)
      .leftJoin(users, eq(visitorLogs.visitorId, users.id))
      .where(
        and(
          eq(visitorLogs.societyId, societyId),
          eq(visitorLogs.entryStatus, 'INSIDE')
        )
      ).all();

    return res.json({ success: true, count: insideVisitors.length, visitors: insideVisitors });
  } catch (error) {
    console.error('[InSociety] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/visitors/log-entry
 * Guard logs entry for a visitor
 * Body: { visitorPhone, destinationFlat, verificationMethod, qrCodeValue? }
 */
router.post('/log-entry', requireRole('GUARD'), async (req, res) => {
  const { visitorPhone, destinationFlat, verificationMethod, qrCodeValue } = req.body;

  if (!visitorPhone || !destinationFlat || !verificationMethod) {
    return res.status(400).json({ success: false, message: 'visitorPhone, destinationFlat, verificationMethod required' });
  }

  try {
    let visitor = null;

    // Find or create guest user
    const existingRows = db.select().from(users).where(eq(users.phoneNumber, visitorPhone)).all();
    visitor = existingRows[0];

    if (!visitor) {
      const info = db.insert(users).values({
        phoneNumber: visitorPhone,
        role: 'GUEST',
        accountStatus: 'APPROVED',
        societyId: req.user.societyId,
      }).run();
      const newRows = db.select().from(users).where(eq(users.id, info.lastInsertRowid)).all();
      visitor = newRows[0];
    }

    // Validate QR pre-approval if method is PRE_APPROVAL
    if (verificationMethod === 'PRE_APPROVAL' && qrCodeValue) {
      const approvals = db
        .select()
        .from(preApprovals)
        .where(eq(preApprovals.qrCodeValue, qrCodeValue))
        .all();

      const approval = approvals[0];
      if (!approval || approval.isUsed || new Date() > new Date(approval.validUntil)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired pre-approval QR' });
      }

      // Mark as used
      db.update(preApprovals).set({ isUsed: true }).where(eq(preApprovals.id, approval.id)).run();
    }

    db.insert(visitorLogs).values({
      visitorId: visitor.id,
      societyId: req.user.societyId,
      guardId: req.user.id,
      destinationFlat,
      verificationMethod,
      entryStatus: 'INSIDE',
    }).run();

    return res.status(201).json({
      success: true,
      message: 'Entry logged successfully',
      visitor: {
        id: visitor.id,
        name: visitor.fullName,
        phone: visitor.phoneNumber,
        role: visitor.role,
      },
    });
  } catch (error) {
    console.error('[LogEntry] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/visitors/log-exit/:logId
 * Guard marks a visitor as exited
 */
router.patch('/log-exit/:logId', requireRole('GUARD'), async (req, res) => {
  const logId = parseInt(req.params.logId, 10);

  try {
    db
      .update(visitorLogs)
      .set({ exitTime: new Date().toISOString(), entryStatus: 'EXITED' })
      .where(eq(visitorLogs.id, logId)).run();
    return res.json({ success: true, message: 'Exit logged' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/visitors/verify-qr
 * Guard scans a QR code to verify entry
 * Body: { qrCodeValue }
 */
router.post('/verify-qr', requireRole('GUARD'), async (req, res) => {
  const { qrCodeValue } = req.body;
  if (!qrCodeValue) {
    return res.status(400).json({ success: false, message: 'qrCodeValue is required' });
  }

  try {
    const rows = db
      .select()
      .from(preApprovals)
      .where(eq(preApprovals.qrCodeValue, qrCodeValue))
      .all();
    const result = rows[0];

    if (!result) {
      return res.status(404).json({ success: false, message: 'QR code not found', verified: false });
    }
    if (result.isUsed) {
      return res.json({ success: false, message: 'QR code already used', verified: false });
    }
    if (new Date() > new Date(result.validUntil)) {
      return res.json({ success: false, message: 'QR code has expired', verified: false });
    }

    return res.json({
      success: true,
      verified: true,
      visitor: {
        name: result.visitorName,
        phone: result.visitorPhone,
        validUntil: result.validUntil,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
