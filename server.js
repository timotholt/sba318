import express from 'express';
import morgan from 'morgan';
import { router as playerRoutes } from './routes/players.js';
import { router as gameRoutes } from './routes/games.js';

const app = express();
const port = 3000;

// Add Morgan middleware for logging
app.use(morgan('dev'));

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// API Routes
app.use('/player', playerRoutes);
app.use('/game', gameRoutes);

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});