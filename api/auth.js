// api/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { pool } = require('../db/connection');
const ensureAuth = require('../utils/ensureAuth');

const router = express.Router();
router.use(cookieParser());

// common cookie options
const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   60 * 60 * 1000, // 1h
};

// ─── SIGN UP ───────────────────────────────────────────────────────────────
router.post(
  '/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  body('name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const { rowCount } = await pool.query(
        'SELECT 1 FROM users WHERE email=$1', [email]
      );
      if (rowCount)
        return res.status(409).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        `INSERT INTO users (full_name,email,password_hash,created_at)
         VALUES($1,$2,$3,NOW()) RETURNING id`,
        [name, email, hashed]
      );
      const userId = rows[0].id;

      const token = jwt.sign({ sub: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, cookieOpts);
      return res.status(201).json({ userId });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── SIGN IN ────────────────────────────────────────────────────────────────
router.post(
  '/signin',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password, role } = req.body;
    const table = role === 'admin' ? 'admins' : 'users';

    try {
      const { rows } = await pool.query(
        `SELECT id,password_hash FROM ${table} WHERE email=$1`, [email]
      );
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash)))
        return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ sub: user.id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, cookieOpts);
      return res.json({
        message: 'Login successful',
        user: { id: user.id, email, role }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── WHO AM I ───────────────────────────────────────────────────────────────
router.get('/me', ensureAuth, (req, res) => {
  res.json({
    id:    req.user.sub,
    email: req.user.email,
    role:  req.user.role
  });
});

// ─── SIGN OUT ───────────────────────────────────────────────────────────────
router.post('/signout', (req, res) => {
  res.clearCookie('token', { sameSite: 'lax', httpOnly: true });
  res.sendStatus(200);
});

module.exports = router;
