const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price::float       AS price,
        p.shoe_category,
        p.created_at,
        p.updated_at,
        -- images pulled in a subquery (no cross-join)
        COALESCE((
          SELECT json_agg(pi.image_url ORDER BY pi.is_primary DESC)
          FROM product_images pi
          WHERE pi.product_id = p.id
        ), '[]') AS images,
        -- variants pulled in a separate subquery
        COALESCE((
          SELECT json_agg(
                   json_build_object(
                     'id',    pv.id,
                     'size',  pv.size,
                     'stock', pv.stock_qty
                   ) ORDER BY pv.size
                 )
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ), '[]') AS variants
      FROM products p
      WHERE p.id = $1
      LIMIT 1;
    `;
    const { rows } = await client.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  } finally {
    client.release();
  }
});

module.exports = router;