const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// simple admin auth middleware
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(adminAuth);

// create a new product
router.post('/', async (req, res) => {
  const { name, description, price, stock_quantity, shoe_category } = req.body;

  if (
    !name ||
    typeof price !== 'number' ||
    typeof stock_quantity !== 'number' ||
    !shoe_category
  ) {
    return res.status(400).json({
      error:
        'Missing or invalid fields. Required: name (string), price (number), stock_quantity (number), shoe_category (string)',
    });
  }

  try {
    const { rows: [product] } = await pool.query(
      `INSERT INTO products
         (name, description, price, stock_quantity, shoe_category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         name,
         description,
         price,
         stock_quantity   AS "stockQuantity",
         shoe_category    AS "shoeCategory",
         created_at       AS "createdAt",
         updated_at       AS "updatedAt"`,
      [name, description, price, stock_quantity, shoe_category]
    );

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// update an existing product
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity, shoe_category } = req.body;

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
  if (stock_quantity != null) {
    if (typeof stock_quantity !== 'number') {
      return res.status(400).json({ error: 'Invalid stock_quantity' });
    }
    sets.push(`stock_quantity = $${values.length + 1}`);
    values.push(stock_quantity);
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
    UPDATE products
       SET ${sets.join(', ')}
     WHERE id = $${values.length}
     RETURNING
       id,
       name,
       description,
       price,
       stock_quantity   AS "stockQuantity",
       shoe_category    AS "shoeCategory",
       created_at       AS "createdAt",
       updated_at       AS "updatedAt"
  `;

  try {
    const { rows: [product] } = await pool.query(query, values);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// delete a product
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
