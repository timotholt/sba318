import express from 'express';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { router as playerRoutes } from './routes/players.js';
import { router as lobbyRoutes } from './routes/lobby.js';
import { connectDB } from './config/database.js';
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

// Connect to MongoDB
connectDB();

// Add Morgan middleware for logging
app.use(morgan('dev'));

// Security middleware
// app.use(mongoSanitize());

// // Rate limiting configuration
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: 'Too many requests from this IP, please try again later',
//   skipSuccessfulRequests: false, // Count successful requests against limit
//   skipFailedRequests: false, // Count failed requests against limit
//   requestWasSuccessful: (req, res) => res.statusCode < 400, // Define what a successful request is
//   keyGenerator: (req) => req.ip, // Use IP for rate limiting
//   handler: (req, res) => {
//     res.status(429).json({
//       success: false,
//       message: 'Too many requests, please try again later'
//     });
//   }
// });

// Apply rate limiting to all routes
//app.use(limiter);

// Middleware for parsing JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// API Routes
app.use('/player', playerRoutes);
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});