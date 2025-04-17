const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db/connection'); // PostgreSQL 连接
require('dotenv').config();

router.post('/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
  
    try {
      // 检查邮箱是否已存在
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }
  
      // 插入用户数据（注意字段名匹配你的表结构）
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id`,
        [email, password, name, 'users']
      );
  
      const userId = result.rows[0].id;
  
      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      return res.status(201).json({ success: true, token, userId });
  
    } catch (err) {
      console.error("Signup Error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
module.exports = router;
