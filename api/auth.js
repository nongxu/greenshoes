// api/auth.js
require('dotenv').config();
const express             = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt              = require('bcrypt');
const jwt                 = require('jsonwebtoken');
const cookieParser        = require('cookie-parser');
const { pool }            = require('../db/connection');
const ensureAuth          = require('../utils/ensureAuth');

const router = express.Router();
router.use(cookieParser());

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   60 * 60 * 1000, // 1 hour
};

// ─── SIGN UP ───────────────────────────────────────────────────────────────
router.post(
  '/signup',
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  body('name').trim().notEmpty().withMessage('Name cannot be empty'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      // Prevent duplicate registrations
      const { rowCount } = await pool.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
      );
      if (rowCount) {
        return res
          .status(409)
          .json({ message: 'That email is already registered' });
      }

      // Hash the password before saving
      const password_hash = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const { rows } = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [name, email, password_hash]
      );
      const newUser = {
        id:   rows[0].id,
        email,
        name,
        role: 'user'
      };

      // Create a JWT and set it as an httpOnly cookie
      const token = jwt.sign(
        { sub: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('token', token, cookieOpts);

      // Return the new user info
      return res
        .status(201)
        .json({ message: 'Signup successful', user: newUser });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Internal server error' });
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
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password, role = 'user' } = req.body;
      const table = role === 'admin' ? 'admins' : 'users';
  
      try {
        const { rows } = await pool.query(
          `SELECT id, ${role === 'user' ? 'full_name,' : ''} password_hash FROM ${table} WHERE email = $1`,
          [email]
        );
        const dbUser = rows[0];
        if (!dbUser || !(await bcrypt.compare(password, dbUser.password_hash))) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const signedUser = {
          id: dbUser.id,
          email,
          name: role === 'admin' ? 'Admin' : dbUser.full_name,
          role
        };
  
        const token = jwt.sign(
          { sub: signedUser.id, email: signedUser.email, role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.cookie('token', token, cookieOpts);
  
        return res.json({
          message: 'Login successful',
          user: signedUser
        });
      } catch (err) {
        console.error('Signin error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
    }
  );
  
  // ─── WHO AM I ───────────────────────────────────────────────────────────────
  router.get('/me', ensureAuth, async (req, res) => {
    const userId = req.user.sub;
    const role = req.user.role;
  
    const table = role === 'admin' ? 'admins' : 'users';
  
    try {
      const { rows } = await pool.query(
        `SELECT id, email ${role === 'user' ? ', full_name' : ''} FROM ${table} WHERE id = $1`,
        [userId]
      );
      if (!rows.length) {
        return res.status(404).json({ message: 'User not found' });
      }
      const u = rows[0];
      return res.json({
        id: u.id,
        email: u.email,
        name: role === 'admin' ? 'Admin' : u.full_name,
        role
      });
    } catch (err) {
      console.error('Error in /me:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

// ─── SIGN OUT ───────────────────────────────────────────────────────────────
router.post('/signout', (req, res) => {
  res.clearCookie('token', { sameSite: 'lax', httpOnly: true });
  res.sendStatus(200);
});

module.exports = router;
