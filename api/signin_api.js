const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

router.post('/signin', async (req, res) => {
    const { email, password, role } = req.body;

    // 根据角色选择不同的表
    const table = role === 'admin' ? 'admins' : 'users';

    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM ${table} WHERE email = $1`,
            [email]
        );
        const user = result.rows[0];

        if (!user || user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
