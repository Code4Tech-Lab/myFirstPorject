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

const express  = require('express');
const cors     = require('cors');
const path     = require('path');

// ── DATABASE BOOTSTRAP ───────────────────────────────────────────────────────
// Run schema migrations BEFORE anything else starts.
// If the DB file doesn't exist it will be created automatically.
const { initializeDatabase } = require('./database/init');
initializeDatabase();

// ── ROUTE MODULES ────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const contactRoutes = require('./routes/contact');

// ── CREATE EXPRESS APP ───────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────

/**
 * CORS — Cross-Origin Resource Sharing
 * Allows the frontend (potentially on a different port/domain) to call the API.
 * In production, replace the origin with your actual domain:
 *   origin: 'https://your-domain.com'
 */
app.use(cors({
  origin:  process.env.ALLOWED_ORIGIN || '*', // Lock down in production
  methods: ['GET', 'POST', 'OPTIONS'],
}));

/**
 * JSON Body Parser
 * Parses incoming request bodies as JSON.
 * limit: '10kb' prevents enormous payloads (a basic DoS mitigation).
 */
app.use(express.json({ limit: '10kb' }));

/**
 * URL-encoded form parser (for standard HTML form submissions as fallback)
 */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Static File Serving
 * Express serves everything in the project root as static files.
 * This makes index.html, /css/, /js/, /pages/ all directly accessible.
 *
 * Accessing http://localhost:3000/              → serves index.html
 * Accessing http://localhost:3000/pages/quiz.html → serves that page
 * Accessing http://localhost:3000/css/base.css  → serves the CSS file
 */
app.use(express.static(path.join(__dirname)));

// ── SECURITY HEADERS ─────────────────────────────────────────────────────────
// Set basic security response headers on every request.
app.use((req, res, next) => {
  // Prevent browsers from MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Block clickjacking — page cannot be embedded in an <iframe>
  res.setHeader('X-Frame-Options', 'DENY');
  // Force HTTPS in production (Strict-Transport-Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  next();
});

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
    error:   process.env.NODE_ENV === 'production'
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
