const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

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

// Create a new order
router.post('/', async (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing userId or items array' });
  }

  try {
    // Look up product prices
    const productIds = items.map(i => i.productId);
    const { rows: products } = await pool.query(
      `SELECT id, price FROM products WHERE id = ANY($1)`,
      [productIds]
    );
    const priceMap = new Map(products.map(p => [p.id, p.price]));

    // Calculate total price
    let total = 0;
    for (const { productId, quantity } of items) {
      const price = priceMap.get(productId);
      if (price == null) {
        return res.status(400).json({ error: `Product ${productId} not found` });
      }
      total += Number(price) * quantity;
    }

    // Insert order record
    const { rows: [order] } = await pool.query(
      `INSERT INTO orders (user_id, total_price)
       VALUES ($1, $2)
       RETURNING
         id,
         user_id   AS "userId",
         total_price AS "totalPrice",
         order_status AS status,
         created_at  AS "createdAt",
         updated_at  AS "updatedAt"`,
      [userId, total]
    );

    // Insert each order item
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

    // Fetch inserted items for response
    const insertedItems = await fetchItems(order.id);

    // Return created order
    res.status(201).json({ order: { ...order, items: insertedItems } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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

// Update order status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['pending', 'shipped', 'delivered'];

  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const { rows: [updated] } = await pool.query(
      `UPDATE orders
         SET order_status = $1,
             updated_at   = now()
       WHERE id = $2
       RETURNING
         id,
         user_id   AS "userId",
         total_price AS "totalPrice",
         order_status AS status,
         created_at  AS "createdAt",
         updated_at  AS "updatedAt"`,
      [status, id]
    );
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await fetchItems(id);
    res.json({ order: { ...updated, items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
