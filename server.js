/**
 * server.js — Express Application Entry Point
 * CyberAware Cybersecurity Education Platform
 *
 * Responsibilities:
 *  - Bootstrap the SQLite database (create tables if needed)
 *  - Serve all static frontend files (HTML, CSS, JS, images)
 *  - Mount API routes under /api
 *  - Apply security middleware (CORS, JSON body parsing, request size limits)
 *  - Global error handler
 *
 * Run with:
 *   npm install
 *   node server.js
 *
 * Then open: http://localhost:3000
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// ── DATABASE BOOTSTRAP ───────────────────────────────────────────────────────
// Run schema migrations BEFORE anything else starts.
// If the DB file doesn't exist it will be created automatically.
const { initializeDatabase } = require('./database/init');
initializeDatabase();

// ── ROUTE MODULES ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');

// ── CREATE EXPRESS APP ───────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── SECURITY MIDDLEWARE: RATE LIMITING ───────────────────────────────────────
/**
 * Global Rate Limiter
 * Limits each IP to 100 requests per 15 minutes.
 * Prevents automated scraping and basic DoS.
 */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);
/**
 * Auth Rate Limiter
 * Stricter limit for login/register to prevent brute force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 mins
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────

/**
 * CORS — Cross-Origin Resource Sharing
 */
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));

/**
 * Body Parsers
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Security Headers (Hardening)
 */
app.disable('x-powered-by');

app.use((req, res, next) => {
  // Prevent browsers from MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Block clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  /**
   * Content Security Policy (CSP)
   * Restricts where resources (scripts, styles, images) can be loaded from.
   * This is a major defense against XSS.
   *
   * FIX: Removed fonts.googleapis.com from script-src — that domain serves
   * fonts/stylesheets, not scripts. Including it in script-src was an
   * unnecessary broadening of the allowed script sources.
   */
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +                                    // scripts: same-origin only
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " + // styles + Google Fonts CSS
    "font-src 'self' https://fonts.gstatic.com; " +            // font files from gstatic
    "img-src 'self' data:; " +
    "connect-src 'self';"
  );

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }

  next();
});

// ── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES ───────────────────────────────────────────────────────────────
// All auth routes are prefixed with /api
// POST /api/register  → routes/auth.js → router.post('/register', ...)
// POST /api/login     → routes/auth.js → router.post('/login', ...)
// GET  /api/users     → routes/auth.js → router.get('/users', ...)
app.use('/api', authRoutes);
app.use('/api/contact', contactRoutes);

// ── 404 HANDLER (API routes only) ────────────────────────────────────────────
// If an /api/* route is not matched above, return JSON 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown inside route handlers.
// Express recognises error-handling middleware by its 4-parameter signature: (err, req, res, next)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('🔴 Unhandled error:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message, // Show detail only in development
  });
});

// ── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🛡️  CyberAware Server Running');
  console.log(`📡  URL:      http://localhost:${PORT}`);
  console.log(`🗄️  Database: ./database/database.db`);
  console.log(`🔧  Mode:     ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('API Endpoints:');
  console.log(`  POST  http://localhost:${PORT}/api/register`);
  console.log(`  POST  http://localhost:${PORT}/api/login`);
  console.log(`  GET   http://localhost:${PORT}/api/users`);
  console.log('');
});

module.exports = app; // Export for testing
