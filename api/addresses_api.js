// api/address_api.js
const express = require('express');
const { pool } = require('../db/connection');
const ensureAuth = require('../utils/ensureAuth');

const router = express.Router();

// All routes in here require a valid JWT cookie
router.use(ensureAuth);

/**
 * GET /api/address_api
 * Returns the address(es) for the current user.
 */
router.get('/', async (req, res) => {
  const userId = req.user.sub;
  try {
    // If you store multiple addresses, query your addresses table.
    // Here we assume `users.address` is a JSON/text field:
    const { rows } = await pool.query(
      'SELECT address FROM users WHERE id = $1',
      [userId]
    );

    const addresses = rows[0]?.address
      ? Array.isArray(rows[0].address)
        ? rows[0].address
        : [rows[0].address]
      : [];

    return res.json(addresses);
  } catch (err) {
    console.error('Error fetching addresses:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/address_api
 * Add a new address in the user's record.
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
      'SELECT address FROM users WHERE id = $1',
      [userId]
    );
    let existing = rows[0]?.address || [];

    if (!Array.isArray(existing)) existing = [existing];
    existing.push({ name, address, phone });

    // Save back
    await pool.query(
      'UPDATE users SET address = $1 WHERE id = $2',
      [existing, userId]
    );

    return res.status(201).json({ name, address, phone });
  } catch (err) {
    console.error('Error saving address:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/address_api/:idx
 * Remove the address at index `idx` from the user's list.
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
      'SELECT address FROM users WHERE id = $1',
      [userId]
    );
    let list = rows[0]?.address || [];
    if (!Array.isArray(list)) list = [list];

    if (idx < 0 || idx >= list.length) {
      return res.status(404).json({ message: 'Address not found' });
    }

    list.splice(idx, 1);
    await pool.query(
      'UPDATE users SET address = $1 WHERE id = $2',
      [list, userId]
    );

    return res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting address:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
