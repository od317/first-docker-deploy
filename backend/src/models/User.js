const db = require('../config/database');

class User {
  // Create new user
  static create(username, email, password, callback) {
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, password], function(err) {
      callback(err, { id: this.lastID });
    });
  }

  // Find user by email
  static findByEmail(email, callback) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], callback);
  }

  // Find user by username
  static findByUsername(username, callback) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], callback);
  }
}

module.exports = User;