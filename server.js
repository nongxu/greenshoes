const express = require('express');
const next = require('next');
// const db = require('./db/connection');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

//db(); // Establish database connection

server.use(express.json());

// Define API routes here
server.get('/api/example', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// Handle Next.js pages
server.all('*', (req, res) => {
    return handle(req, res);
});

app.prepare().then(() => {
    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});

// const startServer = async () => {
//     await db.connectDB();
//     server.listen(3000, () => {
//         console.log('Server running on http://localhost:3000');
//     });
// }

// startServer();