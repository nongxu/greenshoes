const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.shoe_category,
        p.created_at,
        p.updated_at,
        pi.image_url AS image
      FROM 
        products p
      LEFT JOIN 
        product_images pi 
      ON 
        p.id = pi.product_id AND pi.is_primary = true
    `;
    
    const params = [];
    const conditions = [];
    
    // Handle exclude parameter
    if (req.query.exclude) {
      conditions.push(`p.id <> $${params.length + 1}`);
      params.push(req.query.exclude);
    }
    
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    // Order results randomly
    query += " ORDER BY random()";
    
    // Handle limit parameter
    if (req.query.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(req.query.limit);
    }
    
    const result = await client.query(query, params);
    client.release();
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;