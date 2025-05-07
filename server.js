require('dotenv').config(); 
const express = require('express');
const next = require('next');
const { connectDB } = require('./db/connection');
const { insertAdmin } = require('./db/insertAdmin');
const cookieParser = require('cookie-parser');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
server.enable('trust proxy');
server.use(express.json());
server.use(cookieParser());
server.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });

async function startServer() {
    await connectDB();      // Establishing a database connection
    await insertAdmin();    // Insert admin, enable admin login
    server.use(express.json());
    server.use(cookieParser());

    // Auth routes
    server.use('/api/auth', require('./api/auth'));

    // Products (public)
    server.use('/api/products', require('./api/products_listing_api'));

    // Product‑management (admin)
    server.use('/api/products-management', require('./api/products_management_api'));

    // Addresses (protected inside the router)
    server.use('/api/addresses', require('./api/addresses_api'));

    // Orders (protected inside the router)
    server.use('/api/orders_api', require('./api/orders_api'));

    // Checkout
    server.use('/api/checkout', require('./api/checkout_api'));

    // Inventory
    server.use('/api/inventory', require('./api/inventory_api'));

    // Product Detail
    server.use('/api/product', require('./api/product_detail_api'));


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
}

startServer();
