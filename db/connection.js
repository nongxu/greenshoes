const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to the PostgreSQL database');

        const res = await pool.query('SELECT NOW()');
        console.log('Current date from the PostgreSQL database:', res.rows[0].now);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

module.exports = {
    pool,
    connectDB,
};