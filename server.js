require('dotenv').config(); 
const express = require('express');
const next = require('next');
const { connectDB } = require('./db/connection');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

connectDB(); // Establishing a database connection

server.use(express.json());

// Mount the updated API routes (now in ./api)
const productsRouter = require('./api/products_api');
server.use('/api/products', productsRouter);

const signupRouter = require('./api/signup_api');
server.use('/api', signupRouter);

const signinRouter = require('./api/signin_api');
server.use('/api', signinRouter);

const addressesRouter = require('./api/addresses_api');
server.use('/api/addresses', addressesRouter);

// Example API route
server.get('/api/example', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// Handle all other routes with Next.js
server.all('*', (req, res) => {
    return handle(req, res);
});

app.prepare().then(() => {
    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
