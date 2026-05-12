const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { users } = require('../db').schema;
const { eq } = require('drizzle-orm');

// In-memory OTP store (swap for Redis in production)
const otpStore = new Map(); // phoneNumber -> { otp, expiresAt }

/**
 * POST /api/auth/send-otp
 * Body: { phoneNumber: string }
 */
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'phoneNumber is required' });
  }

  // Hardcoded OTP for development
  const otp = '123456';
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phoneNumber, { otp, expiresAt });

  // TODO: Integrate SMS provider (e.g., Msg91 / Twilio) here
  console.log(`[OTP] ${phoneNumber} -> ${otp}`);

  return res.json({
    success: true,
    message: 'OTP sent successfully',
    // Only expose OTP in development for testing
    ...(process.env.NODE_ENV !== 'production' && { otp }),
  });
});

/**
 * POST /api/auth/verify-otp
 * Body: { phoneNumber: string, otp: string }
 */
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: 'phoneNumber and otp are required' });
  }

  const stored = otpStore.get(phoneNumber);

  if (!stored) {
    return res.status(401).json({ success: false, message: 'No OTP sent for this number. Request one first.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (stored.otp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }

  // OTP validated – clean up
  otpStore.delete(phoneNumber);

  try {
    const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_123';

    // Check if user exists in DB
    const existingUsers = db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).all();
    let user = existingUsers[0];

    if (!user) {
      // New user — create as GUEST pending admin approval
      const info = db.insert(users).values({
        phoneNumber,
        role: 'GUEST',
        accountStatus: 'PENDING',
      }).run();
      
      const newUserRows = db.select().from(users).where(eq(users.id, info.lastInsertRowid)).all();
      user = newUserRows[0];
    }

    if (user.accountStatus === 'BANNED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }
    if (user.accountStatus === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        societyId: user.societyId,
        fullName: user.fullName,
      },
      SECRET_KEY,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        societyId: user.societyId,
        fullName: user.fullName,
        flatNumber: user.flatNumber,
        profilePhotoUrl: user.profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error('[Auth Error]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
