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
            'stock_qty', pv.stock_qty
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
  const {
    name,
    description,
    price,
    shoe_category,
    variants = [],
    images = []
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 动态构造 products 更新
    const fields = [];
    const values = [];
    let idx = 1;

    if (name != null) {
      fields.push(`name = $${idx}`);
      values.push(name);
      idx++;
    }
    if (description != null) {
      fields.push(`description = $${idx}`);
      values.push(description);
      idx++;
    }
    if (price != null) {
      fields.push(`price = $${idx}`);
      values.push(price);
      idx++;
    }
    if (shoe_category != null) {
      fields.push(`shoe_category = $${idx}`);
      values.push(shoe_category);
      idx++;
    }

    if (fields.length > 0) {
      // 添加更新时间字段，无需占位符
      fields.push(`updated_at = now()`);
      // 把 id 作为最后一个参数
      const updateQuery = `
        UPDATE products
           SET ${fields.join(', ')}
         WHERE id = $${idx}
      `;
      values.push(id);
      await client.query(updateQuery, values);
    }

    // 2. 处理 variants（可根据需要调整顺序）
    await client.query(`DELETE FROM product_variants WHERE product_id=$1`, [id]);
    for (const v of variants) {
      await client.query(
        `INSERT INTO product_variants (product_id,size,stock_qty)
         VALUES ($1,$2,$3)`,
        [id, v.size, v.stock_qty]
      );
    }

    // 3. 处理 images
    // ...existing code for deleting/inserting images...

    await client.query('COMMIT');

    // 4. 返回最新数据
    const { rows } = await client.query(
      `SELECT p.*, 
              COALESCE(json_agg(json_build_object(
                'id',       pv.id,
                'size',     pv.size,
                'stock',    pv.stock_qty
              )) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
              COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
         FROM products p
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id;`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Update failed' });
  } finally {
    client.release();
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
