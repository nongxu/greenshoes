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
      const { stock_qty, size, product_name } = rows[0];
      if (rows[0].stock_qty < quantity) {
        throw {
          status: 400,
          message: `Insufficient stock for "${product_name}" (size ${size}): only ${stock_qty} left`
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

      await client.query(
        `UPDATE users
           SET full_name        = $1,
               phone            = $2,
               delivery_address = $3,
               billing_address  = $4
         WHERE id = $5`,
        [
          name,             // maps to users.full_name
          phone,            // maps to users.phone
          shippingAddress,  // now a TEXT column
          billingAddress,   // TEXT column
          userId
        ]
      );

      const last4 = cardNumber.slice(-4);
      // encrypt & store CC info ──
      await client.query(
        `UPDATE users
           SET encrypted_cc_number    = pgp_sym_encrypt($1, 'your_key'),
               encrypted_cc_expiration = pgp_sym_encrypt($2, 'your_key'),
               encrypted_cc_cvc        = pgp_sym_encrypt($3, 'your_key'),
               credit_card_last4      = $4
         WHERE id = $5`,
        [cardNumber, expiration, cvc, last4,userId]
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