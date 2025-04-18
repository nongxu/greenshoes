// /api/inventory_api.js

const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// route: update inventory
// PATCH /api/inventory_api
router.patch('/', async (req, res) => {
  const { productId, quantity } = req.body;

  // basic validation
  if (!productId || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid productId or quantity." });
  }

  try {
    // Trying to reduce inventory
    const result = await pool.query(
      `UPDATE products
          SET stock_quantity = stock_quantity - $1
        WHERE id = $2 AND stock_quantity >= $1
        RETURNING id, name, stock_quantity`,
      [quantity, productId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: "Insufficient stock or product not found." });
    }

    return res.status(200).json({ success: true, updated: result.rows[0] });
  } catch (err) {
    console.error("Inventory update error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;

