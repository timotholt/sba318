import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { router as userRoutes } from './routes/users.js';
import { router as lobbyRoutes } from './routes/lobby.js';
import { router as adminRoutes } from './routes/admin.js';
import { router as chatRoutes } from './routes/chat.js';
import { db } from './database/database.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandling.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Request processing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(mongoSanitize());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Custom middleware
app.use(requestLogger);

// Static files
app.use(express.static('public'));
app.use('/utils', express.static('utils'));

// Routes
app.use('/user', userRoutes);
app.use('/lobby', lobbyRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);

// Root route
app.get('/about', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start the database
try {
    await db.connect();
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

// Start the server
import { buildInfo } from './buildInfo.js';

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Game Server Version: ${buildInfo.version} (Built: ${buildInfo.buildDate})`);
});