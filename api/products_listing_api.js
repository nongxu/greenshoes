const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    // Build base query with variants aggregated
    let query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price::float          AS price,
        p.shoe_category,
        p.created_at,
        p.updated_at,
        pi.image_url            AS image,
        COALESCE(json_agg(
          json_build_object(
            'id',    pv.id,
            'size',  pv.size,
            'stock', pv.stock_qty
          ) ORDER BY pv.size
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants
      FROM products p
      LEFT JOIN product_images pi
        ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN product_variants pv
        ON p.id = pv.product_id
    `;

    const params = [];
    const conditions = [];

    // exclude single product
    if (req.query.exclude) {
      params.push(req.query.exclude);
      conditions.push(`p.id <> $${params.length}`);
    }
    // filter by category
    if (req.query.category) {
      params.push(req.query.category);
      conditions.push(`p.shoe_category = $${params.length}`);
    }

    // apply WHERE
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // GROUP and randomize
    query += `
      GROUP BY
        p.id, p.name, p.description, p.price,
        p.shoe_category, p.created_at, p.updated_at,
        pi.image_url
      ORDER BY random()
    `;

    // limit
    if (req.query.limit) {
      params.push(Number(req.query.limit));
      query += ` LIMIT $${params.length}`;
    }

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;