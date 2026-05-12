require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const helperRoutes = require('./routes/helpers');
const visitorRoutes = require('./routes/visitors');
const adminRoutes = require('./routes/admin');
const alertRoutes = require('./routes/alerts');
const deliveryRoutes = require('./routes/delivery');
const marketplaceRoutes = require('./routes/marketplace');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'SafeNest API is running', version: '1.0.0' });
});

// ── 404 Fallback ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  SafeNest API running on http://localhost:${PORT}`);
  console.log(`   DB Host: ${process.env.DB_HOST}`);
  console.log(`   DB Name: ${process.env.DB_NAME}\n`);
});

// ── Keep process alive even if DB is unreachable ───────────
process.on('unhandledRejection', (reason) => {
  console.warn('[Unhandled Rejection] Server continuing. Reason:', reason?.message ?? reason);
});

process.on('uncaughtException', (err) => {
  console.warn('[Uncaught Exception] Server continuing. Error:', err.message);
});
