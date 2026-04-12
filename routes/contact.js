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

/**
 * POST /api/contact
 * Handles contact form submissions.
 */
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Required fields missing.' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    if (message.length < 20) {
      return res.status(400).json({ success: false, error: 'Message too short (min 20 chars).' });
    }

    // ── Save to DB ──────────────────────────────────────────────────────────
    // Added await for the async contactModel call
    const { id } = await createContact({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone ? phone.trim() : null,
      subject:   subject,
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
