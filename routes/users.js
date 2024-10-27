import express from 'express';
import { validateUsername } from '../middleware/validation.js';
import { UserDB } from '../models/User.js';
import { GameStateDB } from '../models/GameState.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/register', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /register - Parameters:`, { 
        username: req.body.username,
        nickname: req.body.nickname,
        passwordLength: req.body.password?.length || 0
    });

    try {
        const { username, password, nickname } = req.body;

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

        await UserDB.create({ 
            username, 
            password,
            nickname: nickname || username 
        });
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

        // // NEW CODE: Clean up any existing game memberships
        // const games = await GameStateDB.findAll();
        // for (const game of games) {
        //     const playerIndex = game.players.indexOf(username);
        //     if (playerIndex !== -1) {
        //         // Remove player and their nickname
        //         game.players.splice(playerIndex, 1);
        //         game.playerNicknames.splice(playerIndex, 1);
        //         await GameStateDB.update({ id: game.id }, { 
        //             players: game.players,
        //             playerNicknames: game.playerNicknames 
        //         });
        //     }
        // }

        console.log(`[${timestamp}] Login successful for user: ${username}`);
        res.json({ 
            success: true,
            nickname: user.nickname 
        });
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

router.post('/logout', validateUsername, async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /logout - Parameters:`, {
        username: req.body.username
    });

    try {
        const { username } = req.body;
        const games = await GameStateDB.findAll();
        
        for (const game of games) {
            if (game.players.includes(username)) {
                game.players = game.players.filter(p => p !== username);
                await GameStateDB.update({ id: game.id }, { players: game.players });
            }
        }
        
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

router.patch('/change-nickname', validateUsername, async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PATCH /change-nickname - Username: ${req.body.username}`);

    try {
        const { username, nickname } = req.body;
        if (!nickname || nickname.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nickname cannot be empty'
            });
        }

        await UserDB.update({ username }, { nickname: nickname.trim() });
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Change nickname error:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to change nickname'
        });
    }
});

router.patch('/change-password', validateUsername, async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PATCH /change-password - Username: ${req.body.username}`);

    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await UserDB.findOne({ username });

        if (!user || user.password !== currentPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        await UserDB.update({ username }, { password: newPassword });
        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Change password error:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

router.delete('/:username', validateUsername, async (req, res) => {
    const timestamp = new Date().toISOString();
    const username = req.params.username;
    console.log(`[${timestamp}] DELETE /${username}`);

    try {
        const result = await UserDB.delete({ username });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Clean up any existing game memberships
        const games = await GameStateDB.findAll();
        for (const game of games) {
            const playerIndex = game.players.indexOf(username);
            if (playerIndex !== -1) {
                game.players.splice(playerIndex, 1);
                game.playerNicknames.splice(playerIndex, 1);
                await GameStateDB.update({ id: game.id }, { 
                    players: game.players,
                    playerNicknames: game.playerNicknames 
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error(`[${timestamp}] Delete account error:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

export { router };