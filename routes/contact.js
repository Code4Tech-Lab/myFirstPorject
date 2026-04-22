/**
 * routes/contact.js — Contact API Routes
 * CyberAware Cybersecurity Education Platform
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { createContact } = require('../models/contactModel');

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// ── CSRF Validation (shared pattern with auth routes) ────────────────────────
// Contact form is a POST endpoint — it must be CSRF-protected.
const CSRF_TOKEN_REGEX = /^[0-9a-f]{32,}$/i;
function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  if (!token || !CSRF_TOKEN_REGEX.test(token)) {
    return res.status(403).json({ success: false, error: 'Forbidden: CSRF token missing or invalid.' });
  }
  next();
};

/**
 * POST /api/contact
 * Handles contact form submissions.
 * CSRF token required — see validateCSRF middleware above.
 */
router.post('/', validateCSRF, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Required fields missing.' });
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return res.status(400).json({ success: false, error: 'Name fields must be under 50 characters.' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    if (subject.length > 150) {
      return res.status(400).json({ success: false, error: 'Subject too long (max 150 chars).' });
    }

    if (message.length < 20 || message.length > 2000) {
      return res.status(400).json({ success: false, error: 'Message must be between 20 and 2000 characters.' });
    }

    // ── Save to DB ──────────────────────────────────────────────────────────
    // Added await for the async contactModel call
    const { id } = await createContact({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone ? phone.trim() : null,
      subject:   subject.trim(),  // FIX: subject was not trimmed before storage
      message:   message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Message received successfully!',
      id
    });

  } catch (err) {
    console.error('[POST /api/contact] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

module.exports = router;
