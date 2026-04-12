/**
 * routes/auth.js — Authentication API Routes
 * CyberAware Cybersecurity Education Platform
 *
 * Endpoints:
 *   POST /api/register  → Create a new user account
 *   POST /api/login     → Authenticate an existing user
 *   GET  /api/users     → List all users (no passwords)
 *
 * Security layers applied at this layer:
 *  1. Input validation (presence, format, length)
 *  2. Email format check with regex
 *  3. Duplicate email check (friendly error before DB constraint)
 *  4. bcryptjs password hashing before any DB write
 *  5. bcryptjs compare on login (timing-safe — prevents timing attacks)
 *  6. Passwords NEVER returned in any response
 *  7. Never expose internal error details to the client
 */

'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const router   = express.Router();

// Import the data-access functions from the model layer
const {
  createUser,
  getUserByEmail,
  getAllUsers,
  emailExists,
} = require('../models/userModel');

// ── CONSTANTS ────────────────────────────────────────────────────────────────
// bcrypt salt rounds: higher = slower hash = harder to brute-force
// 12 is a good balance between security and server load (~250ms on modern hardware)
const BCRYPT_ROUNDS = 12;

// Email validation regex (same as frontend for consistency)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// ── HELPER: Centralised error responder ──────────────────────────────────────
/**
 * sendError(res, statusCode, message)
 * Returns a consistent JSON error shape for all failure responses.
 * Never includes stack traces or internal DB messages in production.
 */
function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/register
// Create a new user account
// Body: { fullName, email, password }
// ════════════════════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // ── STEP 1: Input Presence Validation ─────────────────────────────────
    if (!fullName || !email || !password) {
      return sendError(res, 400, 'All fields are required: fullName, email, password');
    }

    // ── STEP 2: Input Sanitization ────────────────────────────────────────
    const trimmedName  = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const rawPassword  = password; // Will be hashed — never stored as-is

    // ── STEP 3: Length Validation ─────────────────────────────────────────
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return sendError(res, 400, 'Full name must be between 2 and 100 characters');
    }
    if (rawPassword.length < 8) {
      return sendError(res, 400, 'Password must be at least 8 characters');
    }

    // ── STEP 4: Email Format Validation ───────────────────────────────────
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return sendError(res, 400, 'Invalid email address format');
    }

    // ── STEP 5: Duplicate Email Check ─────────────────────────────────────
    if (await emailExists(trimmedEmail)) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    // ── STEP 6: Hash Password ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

    // ── STEP 7: Insert Into Database ──────────────────────────────────────
    const { id } = await createUser(trimmedName, trimmedEmail, hashedPassword);

    // ── STEP 8: Respond (never return the password hash) ──────────────────
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id,
        fullName: trimmedName,
        email:    trimmedEmail,
      },
    });

  } catch (err) {
    // Log the real error server-side for debugging
    console.error('[POST /api/register] Error:', err.message);

    // Handle SQLite UNIQUE constraint race condition (two simultaneous registrations)
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    // Generic 500 — never expose err.message to the client in production
    return sendError(res, 500, 'Registration failed. Please try again later.');
  }
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/login
// Authenticate an existing user
// Body: { email, password }
// ════════════════════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── STEP 1: Validate Presence ─────────────────────────────────────────
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ── STEP 2: Email Format ───────────────────────────────────────────────
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return sendError(res, 400, 'Invalid email address format');
    }

    // ── STEP 3: Look Up User ───────────────────────────────────────────────
    const user = await getUserByEmail(trimmedEmail);

    // ── STEP 4: timing-safe comparison ────────────────────────────────────
    // IMPORTANT: We do NOT return early if the user is not found.
    // Instead we compare against a dummy hash. This prevents TIMING ATTACKS
    // where an attacker can determine whether an email exists based on
    // how quickly the server responds.
    //
    // If user doesn't exist → compare dummy hash (still takes ~250ms)
    // If user exists        → compare real hash (also ~250ms)
    // Either way, the response time reveals nothing.
    const DUMMY_HASH   = '$2b$12$invalidhashforsafecomparison000000000000000000000000000';
    const storedHash   = user ? user.password : DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (!user || !passwordMatch) {
      // Deliberately vague — don't tell attacker whether email exists
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── STEP 5: Respond (omit password hash) ──────────────────────────────
    // NOTE: In production, issue a JWT or session cookie here.
    // For this demo we return the user profile only.
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id:         user.id,
        fullName:   user.fullName,
        email:      user.email,
        created_at: user.created_at,
      },
    });

  } catch (err) {
    console.error('[POST /api/login] Error:', err.message);
    return sendError(res, 500, 'Login failed. Please try again later.');
  }
});

// ════════════════════════════════════════════════════════════════════════════
// GET /api/users
// Return all registered users (without passwords)
// In production this endpoint should be protected by admin middleware.
// ════════════════════════════════════════════════════════════════════════════
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      count:   users.length,
      users,
    });
  } catch (err) {
    console.error('[GET /api/users] Error:', err.message);
    return sendError(res, 500, 'Could not retrieve users.');
  }
});

module.exports = router;
