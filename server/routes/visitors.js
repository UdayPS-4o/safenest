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
    await db.insert(preApprovals).values({
      residentId: req.user.id,
      societyId: req.user.societyId,
      visitorName,
      visitorPhone,
      qrCodeValue,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
    });

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
    const activeApprovals = await db
      .select()
      .from(preApprovals)
      .where(
        and(
          eq(preApprovals.residentId, req.user.id),
          eq(preApprovals.isUsed, false)
        )
      );

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
    await db.delete(preApprovals)
      .where(and(eq(preApprovals.id, id), eq(preApprovals.residentId, req.user.id)));
    return res.json({ success: true, message: 'Pre-approval cancelled' });
  } catch (error) {
    console.error('[DeletePreApproval] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/visitors/in-society
 */
router.get('/in-society', requireRole('GUARD', 'ADMIN', 'RESIDENT'), async (req, res) => {
  const societyId = req.user.societyId;

  try {
    const rows = await db
      .select()
      .from(visitorLogs)
      .leftJoin(users, eq(visitorLogs.visitorId, users.id))
      .where(
        and(
          eq(visitorLogs.societyId, societyId),
          eq(visitorLogs.entryStatus, 'INSIDE')
        )
      );

    const insideVisitors = rows.map(r => ({
      logId: r.visitor_logs?.id,
      entryTime: r.visitor_logs?.entryTime,
      entryStatus: r.visitor_logs?.entryStatus,
      destinationFlat: r.visitor_logs?.destinationFlat,
      verificationMethod: r.visitor_logs?.verificationMethod,
      visitorId: r.users?.id,
      visitorName: r.users?.fullName,
      visitorPhone: r.users?.phoneNumber,
      visitorRole: r.users?.role,
    }));

    return res.json({ success: true, count: insideVisitors.length, visitors: insideVisitors });
  } catch (error) {
    console.error('[InSociety] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/visitors/log-entry
 */
router.post('/log-entry', requireRole('GUARD'), async (req, res) => {
  const { visitorPhone, destinationFlat, verificationMethod, qrCodeValue } = req.body;

  if (!visitorPhone || !destinationFlat || !verificationMethod) {
    return res.status(400).json({ success: false, message: 'visitorPhone, destinationFlat, verificationMethod required' });
  }

  try {
    let visitor = null;

    const existingRows = await db.select().from(users).where(eq(users.phoneNumber, visitorPhone));
    visitor = existingRows[0];

    if (!visitor) {
      const info = await db.insert(users).values({
        phoneNumber: visitorPhone,
        role: 'GUEST',
        accountStatus: 'APPROVED',
        societyId: req.user.societyId,
      });
      const newRows = await db.select().from(users).where(eq(users.id, info[0].insertId));
      visitor = newRows[0];
    }

    if (verificationMethod === 'PRE_APPROVAL' && qrCodeValue) {
      const approvals = await db
        .select()
        .from(preApprovals)
        .where(eq(preApprovals.qrCodeValue, qrCodeValue));

      const approval = approvals[0];
      if (!approval || approval.isUsed || new Date() > new Date(approval.validUntil)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired pre-approval QR' });
      }

      await db.update(preApprovals).set({ isUsed: true }).where(eq(preApprovals.id, approval.id));
    }

    await db.insert(visitorLogs).values({
      visitorId: visitor.id,
      societyId: req.user.societyId,
      guardId: req.user.id,
      destinationFlat,
      verificationMethod,
      entryStatus: 'INSIDE',
    });

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
 */
router.patch('/log-exit/:logId', requireRole('GUARD'), async (req, res) => {
  const logId = parseInt(req.params.logId, 10);

  try {
    await db
      .update(visitorLogs)
      .set({ exitTime: new Date(), entryStatus: 'EXITED' })
      .where(eq(visitorLogs.id, logId));
    return res.json({ success: true, message: 'Exit logged' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/visitors/verify-qr
 */
router.post('/verify-qr', requireRole('GUARD'), async (req, res) => {
  const { qrCodeValue } = req.body;
  if (!qrCodeValue) {
    return res.status(400).json({ success: false, message: 'qrCodeValue is required' });
  }

  try {
    const rows = await db
      .select()
      .from(preApprovals)
      .where(eq(preApprovals.qrCodeValue, qrCodeValue));
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
