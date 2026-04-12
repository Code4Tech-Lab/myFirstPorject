/**
 * models/contactModel.js — Contact Data Access Layer (sqlite3 version)
 */

'use strict';

const db = require('../database/db');

/**
 * createContact(data)
 * @returns {Promise<{id: number}>}
 */
function createContact(data) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO contacts (firstName, lastName, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.firstName,
      data.lastName,
      data.email.toLowerCase().trim(),
      data.phone,
      data.subject,
      data.message
    ];

    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

/**
 * getAllContacts()
 * @returns {Promise<Array>}
 */
function getAllContacts() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM contacts ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  createContact,
  getAllContacts
};
