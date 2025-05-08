// api/address_api.js
const express = require('express');
const { pool } = require('../db/connection');
const ensureAuth = require('../utils/ensureAuth');

const router = express.Router();

// All routes in here require a valid JWT cookie
router.use(ensureAuth);

/**
 * GET /api/address_api
 * Returns the delivery address(es) for the current user.
 */
router.get('/', async (req, res) => {
  const userId = req.user.sub;
  try {
    const { rows } = await pool.query(
      'SELECT delivery_address FROM users WHERE id = $1',
      [userId]
    );

    let list = [];
    const raw = rows[0]?.delivery_address;

    if (raw) {
      if (typeof raw === 'string') {
        try {
          // JSON‐stored addresses
          list = JSON.parse(raw);
        } catch {
          // fallback single string → wrap as one address
          list = [{ name: 'Default', address: raw, phone: '' }];
        }
      } else {
        // already a JSON object/array
        list = raw;
      }
    }

    return res.json(list);
  } catch (err) {
    console.error('Error fetching delivery addresses:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/address_api
 * Add a new delivery address in the user's record.
 * Expects { name: string, address: string } in body.
 */
router.post('/', async (req, res) => {
  const userId = req.user.sub;
  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
    return res.status(400).json({ message: 'Name, address, and phone are required' });
  }  

  try {
    // Fetch existing
    const { rows } = await pool.query(
      'SELECT delivery_address FROM users WHERE id = $1',
      [userId]
    );

    // Parse json address
    let list = [];
    if (rows[0]?.delivery_address) {
      if (typeof rows[0].delivery_address === 'string') {
        try {
          list = JSON.parse(rows[0].delivery_address);
        } catch (err) {
          console.error('Failed to parse delivery address JSON', err);
          return res.status(500).json({ message: 'Invalid delivery address data' });
        }
      } else {
        list = rows[0].delivery_address;
      }
    }
    
    list.push({ name, address, phone });

    // Save back
    await pool.query(
      'UPDATE users SET delivery_address = $1 WHERE id = $2',
      [JSON.stringify(list), userId]
    );

    return res.status(201).json({ name, address, phone });
  } catch (err) {
    console.error('Error saving delivery address:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/address_api/:idx
 * Remove the delivery address at index `idx` from the user's list.
 */
router.delete('/:idx', async (req, res) => {
  const userId = req.user.sub;
  const idx = parseInt(req.params.idx, 10);

  if (isNaN(idx)) {
    return res.status(400).json({ message: 'Invalid index' });
  }

  try {
    // Load, remove, save
    const { rows } = await pool.query(
      'SELECT delivery_address FROM users WHERE id = $1',
      [userId]
    );
    
    // Parse json address
    let list = [];
    if (rows[0]?.delivery_address) {
      if (typeof rows[0].delivery_address === 'string') {
        try {
          list = JSON.parse(rows[0].delivery_address);
        } catch (err) {
        console.error('Failed to parse delivery address JSON', err);
        return res.status(500).json({ message: 'Invalid delivery address data' });
        }
      } else {
        list = rows[0].delivery_address;
      }
    }

    list.splice(idx, 1);

    // Delete
    await pool.query(
      'UPDATE users SET delivery_address = $1 WHERE id = $2',
      [JSON.stringify(list), userId]
    );

    return res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting delivery address:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
