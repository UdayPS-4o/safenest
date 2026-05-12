const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, visitorLogs } = require('../db').schema;
const { eq } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ── Mocked delivery data (real API replaces this later) ─────
// Keyed by userId for demo purposes — all delivery partners are
// assumed to be delivering to the same mock address for now.
const MOCK_DELIVERY = {
  residentName: 'Arjun Sharma',
  residentFlat: 'Tower 4 – Flat B201',
  society: 'Whitefield Society',
  orderInfo: 'Food order #SW-482910',
  platform: 'Swiggy',
  estimatedArrival: '1:55 PM',
  orderPlaced: '1:35 PM',
};

/**
 * POST /api/delivery/scan
 * Guard scans a delivery partner's identity QR.
 * QR value format: "DEL:<userId>"
 * Body: { qrValue: string }
 * Auth: GUARD JWT required
 */
router.post('/scan', authMiddleware, requireRole('GUARD'), async (req, res) => {
  const { qrValue } = req.body;

  if (!qrValue || !qrValue.startsWith('DEL:')) {
    return res.status(400).json({ success: false, message: 'Invalid delivery QR format' });
  }

  const userId = parseInt(qrValue.replace('DEL:', ''), 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid delivery QR value' });
  }

  try {
    // Look up the delivery partner
    const rows = await db.select().from(users).where(eq(users.id, userId));
    const partner = rows[0];

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    }

    if (partner.role !== 'DELIVERY') {
      return res.status(403).json({ success: false, message: 'This QR does not belong to a delivery partner' });
    }

    if (partner.accountStatus === 'BANNED') {
      return res.status(403).json({ success: false, message: 'This delivery partner account is suspended' });
    }

    // Log the entry into visitor_logs
    await db.insert(visitorLogs).values({
      visitorId: partner.id,
      societyId: req.user.societyId,
      guardId: req.user.id,
      destinationFlat: MOCK_DELIVERY.residentFlat,
      verificationMethod: 'QR_SCAN',
      entryStatus: 'INSIDE',
    });

    console.log(
      `[Delivery Scan] Guard ${req.user.id} admitted ${partner.fullName || partner.phoneNumber}` +
      ` → ${MOCK_DELIVERY.residentFlat}`
    );

    return res.json({
      success: true,
      verified: true,
      message: 'Delivery partner verified and entry logged',
      partner: {
        id: partner.id,
        fullName: partner.fullName || 'Delivery Partner',
        phone: partner.phoneNumber,
        partnerId: partner.partnerId,
      },
      delivery: {
        residentName: MOCK_DELIVERY.residentName,
        residentFlat: MOCK_DELIVERY.residentFlat,
        society: MOCK_DELIVERY.society,
        orderInfo: MOCK_DELIVERY.orderInfo,
        platform: MOCK_DELIVERY.platform,
        estimatedArrival: MOCK_DELIVERY.estimatedArrival,
        orderPlaced: MOCK_DELIVERY.orderPlaced,
      },
    });
  } catch (error) {
    console.error('[Delivery Scan] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
