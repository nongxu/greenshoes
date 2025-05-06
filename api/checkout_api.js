const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const jwt = require('jsonwebtoken');

// Helper: fetch product prices
async function fetchProductPrices(productIds) {
  const { rows } = await pool.query(
    `SELECT id, price FROM products WHERE id = ANY($1)`,
    [productIds]
  );
  return new Map(rows.map(p => [p.id, p.price]));
}

// POST /api/checkout
router.post('/', async (req, res) => {
  const {
    name,
    phone,
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
    // Try to read token and extract user ID
    let userId = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.sub;
      } catch (err) {
        console.warn("Invalid token, proceeding as guest checkout");
        // If the token is wrong, proceed as a guest
      }
    }

    // Lookup product prices
    const productIds = items.map(i => i.productId);
    const priceMap = await fetchProductPrices(productIds);

    // Calculate total price
    let total = 0;
    for (const { productId, quantity } of items) {
      const price = priceMap.get(productId);
      if (price == null) {
        return res.status(400).json({ success: false, message: `Product ${productId} not found` });
      }
      total += Number(price) * quantity;
    }

    // Insert into orders table
    const { rows: [order] } = await pool.query(
      `INSERT INTO orders (user_id, total_price)
      VALUES ($1, $2)
      RETURNING id`,
      [userId, total]
    );

    // Insert order items
    await Promise.all(
      items.map(({ productId, quantity }) =>
        pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, productId, quantity, priceMap.get(productId)]
        )
      )
    );

    // Insert into user_order_history
    await pool.query(
      `INSERT INTO user_order_history (user_id, order_id, status)
       VALUES ($1, $2, $3)`,
      [userId, order.id, order.order_status || 'pending']
    );
    
    // Return success with the new order ID
    res.status(200).json({ success: true, orderId: order.id });

  } catch (err) {
    console.error("Error in checkout_api:", err);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

module.exports = router;
