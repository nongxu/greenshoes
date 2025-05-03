const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection'); 

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.shoe_category,
        p.created_at,
        p.updated_at,
        COALESCE(json_agg(pi.image_url ORDER BY pi.is_primary DESC) 
          FILTER (WHERE pi.image_url IS NOT NULL), '[]'::json) AS images
      FROM products p
      LEFT JOIN product_images pi 
        ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id
      LIMIT 1;
    `;
    const result = await client.query(query, [id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;