import express from 'express';
import { validateUsername } from '../middleware/validation.js';
import { UserDB } from '../models/User.js';
import { games } from '../models/gameState.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/register', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /register - Parameters:`, { 
        username: req.body.username,
        passwordLength: req.body.password?.length || 0
    });

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.log(`[${timestamp}] Registration failed: Missing credentials`);
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const existingUser = await UserDB.findOne({ username });
        if (existingUser) {
            console.log(`[${timestamp}] Registration failed: Username ${username} already exists`);
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        await UserDB.create({ username, password });
        console.log(`[${timestamp}] Registration successful for user: ${username}`);

        res.json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error(`[${timestamp}] Registration error:`, error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

router.post('/login', validateUsername, async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /login - Parameters:`, {
        username: req.body.username,
        passwordLength: req.body.password?.length || 0
    });

    try {
        const { username, password } = req.body;

        const user = await UserDB.findOne({ username });
        if (!user || user.password !== password) {
            console.log(`[${timestamp}] Login failed: Invalid credentials for user ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        console.log(`[${timestamp}] Login successful for user: ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Login error:`, error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

router.get('/admin-url', (req, res) => {
    res.json({ url: process.env.MONGO_ADMIN_URL });
});

router.post('/logout', validateUsername, (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /logout - Parameters:`, {
        username: req.body.username
    });

    try {
        const { username } = req.body;
        games.forEach(game => {
            if (game.players.includes(username)) {
                game.players = game.players.filter(p => p !== username);
            }
        });
        console.log(`[${timestamp}] Logout successful for user: ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Logout error:`, error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

export { router };