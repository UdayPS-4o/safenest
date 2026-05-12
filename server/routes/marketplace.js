const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { marketplaceListings } = require('../db/schema.mysql');
const { eq, and, desc, or, like } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');

// All marketplace routes require authentication
router.use(authMiddleware);

/**
 * GET /api/marketplace
 * Get all active listings for the society (with optional filter)
 */
router.get('/', async (req, res) => {
  const { type, category, search } = req.query;
  const societyId = req.user.societyId;

  try {
    let rows = await db
      .select()
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.societyId, societyId),
          eq(marketplaceListings.status, 'ACTIVE')
        )
      )
      .orderBy(desc(marketplaceListings.createdAt));

    // Client-side filters (small dataset, fine to do here)
    if (type) rows = rows.filter(r => r.type === type.toUpperCase());
    if (category) rows = rows.filter(r => r.category === category);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, listings: rows });
  } catch (err) {
    console.error('[Marketplace:List] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/marketplace/my
 * Get listings created by the logged-in user
 */
router.get('/my', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, req.user.id))
      .orderBy(desc(marketplaceListings.createdAt));

    return res.json({ success: true, listings: rows });
  } catch (err) {
    console.error('[Marketplace:My] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/marketplace/:id
 * Get a single listing
 */
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .limit(1);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    return res.json({ success: true, listing });
  } catch (err) {
    console.error('[Marketplace:Get] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * POST /api/marketplace
 * Create a new listing
 */
router.post('/', async (req, res) => {
  const { title, description, type, price, rentPeriod, category, imageUrl } = req.body;

  if (!title || !type) {
    return res.status(400).json({ success: false, message: 'title and type are required' });
  }
  if (!['SELL', 'RENT', 'FREE'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type must be SELL, RENT, or FREE' });
  }
  if ((type === 'SELL' || type === 'RENT') && !price) {
    return res.status(400).json({ success: false, message: 'price is required for SELL/RENT listings' });
  }

  try {
    const result = await db.insert(marketplaceListings).values({
      sellerId: req.user.id,
      societyId: req.user.societyId,
      title: title.trim(),
      description: description?.trim() || null,
      type,
      price: type === 'FREE' ? null : parseInt(price, 10),
      rentPeriod: type === 'RENT' ? (rentPeriod || 'per day') : null,
      category: category || 'Other',
      imageUrl: imageUrl || null,
      sellerFlat: req.user.flatNumber || null,
      sellerName: req.user.fullName || null,
      sellerPhone: req.user.phoneNumber || null,
      status: 'ACTIVE',
    });

    const [created] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, result[0].insertId))
      .limit(1);

    console.log(`[Marketplace] New listing by ${req.user.fullName}: ${title} (${type})`);
    return res.status(201).json({ success: true, listing: created });
  } catch (err) {
    console.error('[Marketplace:Create] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/marketplace/:id/status
 * Mark a listing as SOLD / RENTED / CLOSED (seller only)
 */
router.patch('/:id/status', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const allowed = ['ACTIVE', 'SOLD', 'RENTED', 'CLOSED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of ${allowed.join(', ')}` });
  }

  try {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .limit(1);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not your listing' });
    }

    await db.update(marketplaceListings)
      .set({ status })
      .where(eq(marketplaceListings.id, id));

    return res.json({ success: true, message: `Listing marked as ${status}` });
  } catch (err) {
    console.error('[Marketplace:Status] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * DELETE /api/marketplace/:id
 * Delete a listing (seller or admin only)
 */
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .limit(1);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not your listing' });
    }

    await db.delete(marketplaceListings).where(eq(marketplaceListings.id, id));
    return res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    console.error('[Marketplace:Delete] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
