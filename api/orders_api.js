// api/orders_api.js
const express = require('express');
const router  = express.Router();
const { pool } = require('../db/connection');
const ensureAuth = require('../utils/ensureAuth');

// Helper: fetch order items joined with product info
async function fetchItems(orderId) {
  const { rows } = await pool.query(
    `SELECT
       oi.id,
       oi.product_id   AS "productId",
       p.name          AS "productName",
       oi.quantity,
       oi.price
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return rows;
}


// Apply authentication guard to all routes
router.use(ensureAuth);

/**
 * GET /api/orders
 * List all orders for the logged‑in user
 */
router.get('/', async (req, res) => {
  const userId = req.user.sub;
  try {
    // Fetch the orders
    const { rows: orders } = await pool.query(
      `SELECT
         id,
         total_price   AS "total",
         order_status  AS status,
         created_at    AS "date"
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Attach items to each
    for (const ord of orders) {
      ord.items = await fetchItems(ord.id);
      // format date
      ord.date = ord.date.toISOString().split('T')[0];
    }

    return res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/orders
 * Create a new order for the current user
 */
router.post('/', async (req, res) => {
  const userId = req.user.sub;
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  try {
    // Lookup product prices
    const productIds = items.map(i => i.productId);
    const { rows: products } = await pool.query(
      `SELECT id, price FROM products WHERE id = ANY($1)`,
      [productIds]
    );
    const priceMap = new Map(products.map(p => [p.id, p.price]));

    // Calculate total
    let total = 0;
    for (const { productId, quantity } of items) {
      const price = priceMap.get(productId);
      if (price == null) {
        return res.status(400).json({ message: `Product ${productId} not found` });
      }
      total += Number(price) * quantity;
    }

    // Insert order
    const { rows: [order] } = await pool.query(
      `INSERT INTO orders (user_id, total_price)
       VALUES ($1, $2)
       RETURNING id, total_price AS "total", order_status AS status, created_at AS "date"`,
      [userId, total]
    );

    // Insert items
    await Promise.all(
      items.map(({ productId, quantity }) =>
        pool.query(
          `INSERT INTO order_items
             (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, productId, quantity, priceMap.get(productId)]
        )
      )
    );

    // Fetch items and format date
    order.items = await fetchItems(order.id);
    order.date = order.date.toISOString().split('T')[0];

    return res.status(201).json({ order });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve order details
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [order] } = await pool.query(
      `SELECT
         id,
         user_id   AS "userId",
         total_price AS "totalPrice",
         order_status AS status,
         created_at  AS "createdAt",
         updated_at  AS "updatedAt"
       FROM orders
       WHERE id = $1`,
      [id]
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await fetchItems(id);
    res.json({ order: { ...order, items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/orders/:id
 * Retrieve a single order by ID (must belong to current user)
 */
router.get('/:id', async (req, res) => {
  const userId = req.user.sub;
  const orderId = req.params.id;
  try {
    const { rows: [order] } = await pool.query(
      `SELECT
         id,
         total_price   AS "total",
         order_status  AS status,
         created_at    AS "date",
         user_id
       FROM orders
       WHERE id = $1`,
      [orderId]
    );
    if (!order || order.user_id !== userId) {
      return res.status(404).json({ message: 'Order not found' });
    }
    delete order.user_id;
    order.items = await fetchItems(order.id);
    order.date  = order.date.toISOString().split('T')[0];

    return res.json({ order });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/orders/:id
 * Update the status of an order (admin use only—you can add role check)
 */
router.patch('/:id', async (req, res) => {
  // you could enforce req.user.role === 'admin' here
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending','shipped','delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message:`Status must be one of ${allowed.join(',')}` });
  }
  try {
    const { rows: [updated] } = await pool.query(
      `UPDATE orders
         SET order_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, total_price AS "total", order_status AS status, created_at AS "date"`,
      [status, id]
    );
    if (!updated) return res.status(404).json({ message:'Order not found' });
    updated.items = await fetchItems(id);
    updated.date  = updated.date.toISOString().split('T')[0];
    return res.json({ order: updated });
  } catch (err) {
    console.error('Error updating order:', err);
    return res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;