const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');

const router = express.Router();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Forbidden" });
        }
        req.user = user;
        next();
    });
}

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT address FROM users WHERE id = $1",
            [userId]
        );
        const addresses = result.rows.length > 0 && result.rows[0].address ? [result.rows[0].address] : [];
        res.status(200).json(addresses);
    } catch (err) {
        console.error("Error fetching addresses:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
});

module.exports = router;
