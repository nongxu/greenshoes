const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../db/connection'); // PostgreSQL connection
require('dotenv').config();

router.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, and password are all required"
    });
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [email, hashedPassword, name, 'users']
    );

    const userId = result.rows[0].id;

    // Generate JWT token
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return success response
    return res.status(201).json({ success: true, token, userId });

  } catch (err) {
    console.error("Signup Error:", err.message);
    console.error(err.stack);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
