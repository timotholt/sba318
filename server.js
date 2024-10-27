import express from 'express';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { router as userRoutes } from './routes/users.js';
import { router as lobbyRoutes } from './routes/lobby.js';
import { db } from './database/database.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Add Morgan middleware for logging
app.use(morgan('dev'));

// Security middleware
// app.use(mongoSanitize());

// Middleware for parsing JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// API Routes
app.use('/user', userRoutes);
app.use('/lobby', lobbyRoutes);

// Root route handler
app.get('/about', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred on the server'
    });
});

// Start the database, exit if we can't start it
try {
    await db.connect();
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

// Start listening for reqeusts!
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
