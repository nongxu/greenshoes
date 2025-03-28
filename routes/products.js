const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Adjust according to db directory configuration

// Define the interface for obtaining product lists
router.get('/', async (req, res) => {
  try {
    // assume that using PostgreSQL and querying data through the db connection
    const result = await db.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error('Error in querying product data:', error);
    res.status(500).json({ error: 'Error in querying product data' });
  }
});

module.exports = router;
