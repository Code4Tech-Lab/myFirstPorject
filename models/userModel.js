/**
 * models/userModel.js — User Data Access Layer (sqlite3 version)
 */

'use strict';

const db = require('../database/db');

/**
 * createUser(fullName, email, hashedPassword)
 * @returns {Promise<{id: number}>}
 */
function createUser(fullName, email, hashedPassword) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)`;
    const params = [fullName, email.toLowerCase().trim(), hashedPassword];
    
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

/**
 * getUserByEmail(email)
 * @returns {Promise<Object|undefined>}
 */
function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email.toLowerCase().trim()], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * getAllUsers()
 * @returns {Promise<Array>}
 */
function getAllUsers() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, fullName, email, created_at FROM users ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * emailExists(email)
 */
function emailExists(email) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 1 FROM users WHERE email = ? LIMIT 1`;
    db.get(sql, [email.toLowerCase().trim()], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getAllUsers,
  emailExists
};
