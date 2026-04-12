/**
 * database/db.js — SQLite Connection Module
 * CyberAware Cybersecurity Education Platform
 *
 * Uses sqlite3 which is:
 * - Asynchronous (callback-based)
 * - Standard Node.js SQLite driver
 */

'use strict';

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, 'database.db');

// Open the database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('🔴 Database connection error:', err.message);
  } else {
    console.log(`✅ SQLite connected: ${DB_PATH}`);
  }
});

// ── PERFORMANCE PRAGMA ──────────────────────────────────────────────────────
// WAL mode improves performance; foreign keys enforce integrity.
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');
});

// ── EXPORT ──────────────────────────────────────────────────────────────────
module.exports = db;
