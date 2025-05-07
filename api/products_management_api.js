const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const adminOnly = require('../utils/adminOnly');

// Middleware to restrict access to admin users
router.use(adminOnly);

// Create a new product
router.post('/', async (req, res) => {
  const { name, description, price, shoe_category, variants = [], images = [] } = req.body;

  if (
    !name ||
    typeof price !== 'number' ||
    !shoe_category
  ) {
    return res.status(400).json({
      error:
        'Missing or invalid fields. Required: name (string), price (number), shoe_category (string)',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [product] } = await client.query(
      `INSERT INTO products (name,description,price,shoe_category)
         VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [name, description, price, shoe_category]
    );
    // insert variants
    for (const v of variants) {
      await client.query(
        `INSERT INTO product_variants (product_id,size,stock_qty)
         VALUES ($1,$2,$3)`,
        [product.id, v.size, v.stock_qty]
      );
    }
    // insert images (if you wish)
    // …
    await client.query('COMMIT');
    // re‐fetch with variants & images
    const result = await pool.query(
      `SELECT 
        p.*, 
        COALESCE(json_agg(
          json_build_object(
            'id',    pv.id,
            'size',  pv.size,
            'stock', pv.stock_qty
          ) ORDER BY pv.size
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
        COALESCE(json_agg(pi.image_url ORDER BY pi.is_primary DESC)
          FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id;`,
      [product.id]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update an existing product
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, shoe_category, variants } = req.body;

  const sets = [];
  const values = [];

  if (name != null) {
    sets.push(`name = $${values.length + 1}`);
    values.push(name);
  }
  if (description != null) {
    sets.push(`description = $${values.length + 1}`);
    values.push(description);
  }
  if (price != null) {
    if (typeof price !== 'number') {
      return res.status(400).json({ error: 'Invalid price' });
    }
    sets.push(`price = $${values.length + 1}`);
    values.push(price);
  }
  if (shoe_category != null) {
    sets.push(`shoe_category = $${values.length + 1}`);
    values.push(shoe_category);
  }

  if (sets.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  sets.push(`updated_at = now()`);
  values.push(id);

  const query = `
  SELECT 
    p.*, 
    COALESCE(json_agg(
      json_build_object(
        'id',    pv.id,
        'size',  pv.size,
        'stock', pv.stock_qty
      ) ORDER BY pv.size
    ) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
    COALESCE(json_agg(pi.image_url ORDER BY pi.is_primary DESC)
      FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
  FROM products p
  LEFT JOIN product_variants pv ON p.id = pv.product_id
  LEFT JOIN product_images pi ON p.id = pi.product_id
  WHERE p.id = $1
  GROUP BY p.id;
`;

  if (Array.isArray(variants)) {
    await pool.query(`DELETE FROM product_variants WHERE product_id=$1`, [id]);
    for (const v of variants) {
      await pool.query(
        `INSERT INTO product_variants (product_id,size,stock_qty)
         VALUES ($1,$2,$3)`,
        [id, v.size, v.stock_qty]
      );
    }
  }

  try {
    const { rows: [product] } = await pool.query(query, values);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM products WHERE id = $1`,
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
