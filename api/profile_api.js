const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { pool } = require('../db/connection');

// GET /api/profile
router.get('/', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  let userId;
  try {
    userId = jwt.verify(token, process.env.JWT_SECRET).sub;
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         full_name         AS "fullName",
         email,
         phone,
         delivery_address  AS "deliveryAddress",
         billing_address   AS "billingAddress",
         credit_card_last4 AS "cardLast4"
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Profile API error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;