require('dotenv').config(); 
const express = require('express');
const next = require('next');
const {connectDB} = require('./db/connection');
const cookieParser = require('cookie-parser');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

connectDB(); // Establishing a database connection


server.use(express.json());
server.use(cookieParser());

// Auth routes
server.use('/api/auth', require('./api/auth'));


// Products (public)
server.use('/api/products', require('./routes/products'));

// Product‑management (admin)
server.use('/api/products-management', require('./api/products_management_api'));

// Orders (protected inside the router)
server.use('/api/orders', require('./api/orders_api'));

// Checkout
server.use('/api/checkout', require('./api/checkout_api'));

// Inventory
server.use('/api/inventory', require('./api/inventory_api'));


// Handling Next.js page requests
server.all('*', (req, res) => {
    return handle(req, res);
});

app.prepare().then(() => {
    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
