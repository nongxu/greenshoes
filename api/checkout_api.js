const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection'); 

// POST /api/checkout_api
router.post('/', async (req, res) => {
  const {
    name,
    shippingAddress,
    billingAddress,
    cardNumber,
    expiration,
    cvc,
    items
  } = req.body;

  // Basic validation of required fields and items array
  if (!name || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Missing required fields or items." });
  }

  // Simulated card verification - for demo purposes only
  if (!cardNumber || cardNumber.length !== 16) {
    return res.status(400).json({ success: false, message: "Invalid card information." });
  }

  try {
    // Optionally, you might insert the order into the database here using transactions.
    // For this demo, we'll simulate order creation and generate a fake orderId.
    const orderId = Math.floor(Math.random() * 1000000); // simulate a unique order ID

    // If you were inserting into your orders table, you might do something like:
    /*
    const orderInsertQuery = `
      INSERT INTO orders (name, shipping_address, billing_address, total, created_at)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING id;
    `;
    const total = items.reduce((sum, item) => sum + (item.quantity * 100), 0); // For example
    const orderResult = await pool.query(orderInsertQuery, [name, shippingAddress, billingAddress, total]);
    const orderId = orderResult.rows[0].id;
    // And then insert order items into order_items table.
    */
    
    // Simulate a delay if needed (e.g., to mimic verification/processing time)
    setTimeout(() => {
      res.status(200).json({ success: true, orderId });
    }, 500);    
  } catch (err) {
    console.error("Error in checkout_api:", err);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

module.exports = router;