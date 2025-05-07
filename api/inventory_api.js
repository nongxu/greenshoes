// /api/inventory_api.js

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// route: update inventory
// PATCH /api/inventory_api
router.patch('/', async (req, res) => {
  const { variantId, quantity } = req.body;
  if (!variantId || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid variantId or quantity.' });
  }
  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE product_variants
         SET stock_qty = stock_qty - $1
       WHERE id = $2 AND stock_qty >= $1
       RETURNING id, size, stock_qty`,
      [quantity, variantId]
    );
    if (!rowCount) {
      return res.status(400).json({ success: false, message: 'Insufficient stock or variant not found.' });
    }
    res.json({ success: true, updated: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

