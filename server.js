require('dotenv').config(); 
const express = require('express');
const next = require('next');
const {connectDB} = require('./db/connection');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

connectDB(); // Establishing a database connection

server.use(express.json());

// Mount the route for the product list
const productsRouter = require('./routes/products');
server.use('/api/products', productsRouter);

// Example API route (other interfaces can be retained)
server.get('/api/example', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

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

// The following is another way to start the server, you can enable the database connection as needed before starting
// const startServer = async () => {
//     await db.connectDB();
//     server.listen(3000, () => {
//         console.log('Server running on http://localhost:3000');
//     });
// }
// startServer();
