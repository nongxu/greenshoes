const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const jwt = require('jsonwebtoken');

// Helper: fetch order items joined with product info
async function fetchItems(orderId) {
  const { rows } = await pool.query(
    `SELECT
       oi.id,
       oi.product_id   AS "productId",
       p.name          AS "productName",    -- <- here
       oi.variant_id   AS "variantId",
       pv.size         AS size,
       oi.quantity,
       oi.price
     FROM order_items oi
     JOIN products p           ON p.id  = oi.product_id
     JOIN product_variants pv  ON pv.id = oi.variant_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId]
  );
  return rows;
}

// Helper: parse token from cookies, return userId or null
function getUserIdFromToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.sub;
  } catch {
    console.warn('Invalid token, treating as guest.');
    return null;
  }
}

/**
 * GET /api/orders_api/:id
 * Lookup an order
 * - If logged in, must match user_id
 * - If guest, only allow access to orders with user_id = NULL
 */
// ⚡ New: Move this route before router.get('/') to avoid routing conflict
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;
  const userId = getUserIdFromToken(req);

  try {
    const { rows: [order] } = await pool.query(
      `SELECT id, user_id, total_price AS "totalPrice", order_status AS status, created_at, updated_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (userId === null) {
      // Guest access: only allow if order.user_id is null
      if (order.user_id !== null) {
        return res.status(403).json({ message: 'Guests cannot access this order.' });
      }
    } else {
      // Logged-in user access: must match
      if (order.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied for this order.' });
      }
    }

    // Fetch order items
    const items = await fetchItems(orderId);

    return res.json({
      order: {
        id: order.id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.created_at.toISOString().split('T')[0],
        updatedAt: order.updated_at.toISOString().split('T')[0],
        items
      }
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * GET /api/orders_api
 * List all orders for logged-in user
 */
router.get('/', async (req, res) => {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required to view your orders.' });
  }

  try {
    const { rows: orders } = await pool.query(
      `SELECT id, total_price AS "totalPrice", order_status AS status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Attach items to each order
    for (const order of orders) {
      order.items = await fetchItems(order.id);
      order.createdAt = order.created_at.toISOString().split('T')[0];
      delete order.created_at;
    }

    return res.json({ orders });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
