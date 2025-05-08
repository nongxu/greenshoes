const express = require('express');
const router  = express.Router();
const { pool }= require('../db/connection');
const jwt     = require('jsonwebtoken');

// Helper: fetch product prices
async function fetchProductPrices(client, productIds) {
  const { rows } = await client.query(
    `SELECT id, price FROM products WHERE id = ANY($1)`,
    [productIds]
  );
  return new Map(rows.map(p => [p.id, p.price]));
}

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

  if (!name || !shippingAddress || !items?.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields or items.' });
  }
  if (!cardNumber || cardNumber.length !== 16) {
    return res.status(400).json({ success: false, message: 'Invalid card information.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // auth / guest logic
    let userId = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.sub;
        if (decoded.role === 'admin') {
          throw { status: 403, message: 'Admin cannot checkout.' };
        }
      } catch (err) {
        console.warn('Proceeding as guest checkout');
      }
    }

    // prices & total
    const productIds = items.map(i => i.productId);
    const priceMap   = await fetchProductPrices(client, productIds);
    let total = 0;
    for (const { productId, quantity } of items) {
      const price = priceMap.get(productId);
      if (price == null) {
        throw { status: 400, message: `Product ${productId} not found` };
      }
      total += Number(price) * quantity;
    }

    // lock & stock check per variant
    for (const { variantId, quantity } of items) {
      const { rows } = await client.query(
        `SELECT stock_qty FROM product_variants WHERE id = $1 FOR UPDATE`,
        [variantId]
      );
      if (!rows.length) {
        throw { status: 400, message: `Variant ${variantId} not found` };
      }
      if (rows[0].stock_qty < quantity) {
        throw {
          status: 400,
          message: `Insufficient stock for size (variant) ${variantId}: only ${rows[0].stock_qty} left`
        };
      }
    }

    // create order
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (user_id, total_price)
       VALUES ($1, $2)
       RETURNING id, order_status`,
      [userId, total]
    );

    // insert order_items & decrement stock
    for (const { productId, variantId, quantity } of items) {
      const price = priceMap.get(productId);
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, variant_id, quantity, price)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, productId, variantId, quantity, price]
      );
      const { rowCount } = await client.query(
        `UPDATE product_variants
           SET stock_qty = stock_qty - $1
         WHERE id = $2
           AND stock_qty >= $1`,
        [quantity, variantId]
      );

      if (rowCount === 0) {
        throw {
          status: 400,
          message: `Insufficient stock for variant ${variantId}`
        };
      }
    }

    // record in user_order_history
    if(userId){
      await client.query(
        `INSERT INTO user_order_history (user_id, order_id, status)
         VALUES ($1,$2,$3)`,
        [userId, order.id, order.order_status || 'pending']
      );

      // ── NEW: save shipping address into users.address ──
      // Fetch existing addresses array (or initialize)
      const { rows: userRows } = await client.query(
        'SELECT address FROM users WHERE id = $1',
        [userId]
      );
      let addrList = [];
      const raw = userRows[0]?.address;
      if (raw) {
        try {
          addrList = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          addrList = [];
        }
      }
      // Append new address object
      addrList.push({
        name:            name,              // from req.body
        address:         shippingAddress,   // from req.body
        phone:           phone              // from req.body
      });
      // Update users.address column
      await client.query(
        `UPDATE users
           SET address = $1
         WHERE id = $2`,
        [JSON.stringify(addrList), userId]
      );
      // ────────────────────────────────────────────────
    }
    
    await client.query('COMMIT');
    res.status(200).json({ success: true, orderId: order.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in checkout_api:', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error.' });
  } finally {
    client.release();
  }
});

module.exports = router;