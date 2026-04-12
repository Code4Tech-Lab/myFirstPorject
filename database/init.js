/**
 * database/init.js — Database Schema Initialisation (sqlite3 version)
 */

'use strict';

const db = require('./db');

/**
 * initializeDatabase()
 * Runs all CREATE TABLE statements.
 * sqlite3 uses db.serialize() to ensure statements run in order.
 */
function initializeDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER  PRIMARY KEY AUTOINCREMENT,
        fullName   TEXT     NOT NULL,
        email      TEXT     NOT NULL UNIQUE,
        password   TEXT     NOT NULL,
        created_at DATETIME DEFAULT (datetime('now'))
      )
    `);

    // Contacts Table
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         INTEGER  PRIMARY KEY AUTOINCREMENT,
        firstName  TEXT     NOT NULL,
        lastName   TEXT     NOT NULL,
        email      TEXT     NOT NULL,
        phone      TEXT,
        subject    TEXT     NOT NULL,
        message    TEXT     NOT NULL,
        created_at DATETIME DEFAULT (datetime('now'))
      )
    `);

    console.log('✅ Database initialization complete (users, contacts).');
  });
}

module.exports = { initializeDatabase };
