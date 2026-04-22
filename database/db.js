/**
 * database/db.js — SQLite Connection Module
 * CyberAware Cybersecurity Education Platform
 *
 * Uses sqlite3 which is:
 * - Asynchronous (callback-based)
 * - Standard Node.js SQLite driver
 *
 * FIX: DB_PATH previously pointed to a directory named 'public' which is
 * wrong and would cause SQLite to fail or create a corrupt file.
 * Corrected to point to 'database.db' inside the database/ folder.
 */

'use strict';

// Load environment variables from .env so process.env.PORT etc. are available
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ── CORRECT PATH: points to the actual .db file inside /database/ ───────────
const DB_PATH = path.join(__dirname, 'database.db');

// Open (or create) the database file
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('🔴 Database connection error:', err.message);
    process.exit(1); // Cannot run without a database — exit early with a clear error
  } else {
    console.log(`✅ SQLite connected: ${DB_PATH}`);
  }
});

// ── PERFORMANCE & INTEGRITY PRAGMAS ─────────────────────────────────────────
// WAL mode improves concurrent read performance.
// Foreign keys enforce relational integrity (disabled in SQLite by default).
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');
});

// ── EXPORT ──────────────────────────────────────────────────────────────────
module.exports = db;
