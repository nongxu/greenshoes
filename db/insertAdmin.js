// db/insertAdmin.js
const { pool } = require('./connection');
const bcrypt = require('bcrypt');

async function insertAdmin() {
  const { rows } = await pool.query('SELECT 1 FROM admins LIMIT 1');
  if (rows.length === 0) {
    console.log('No admin found, creating initial admin...');
    const email = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );
    console.log('Initial admin created.');
  }
}

module.exports = { insertAdmin };
