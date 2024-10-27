import express from 'express';
import { validateUsername, validateNickname, validateUserId } from '../middleware/validation.js';
import { validation } from '../utils/validation.js';
import { UserDB } from '../models/User.js';
import { GameStateDB } from '../models/GameState.js';
import { ChatDB } from '../models/Chat.js';
import { APIError } from '../middleware/errorHandling.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/register', async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /register - Parameters:`, { 
        username: req.body.username,
        nickname: req.body.nickname,
        passwordLength: req.body.password?.length || 0
    });

    try {
        const { username, password, nickname } = req.body;

        if (!username || !password) {
            throw new APIError('Username and password are required', 400);
        }

        const existingUser = await UserDB.findOne({ username });
        if (existingUser) {
            throw new APIError('Username already exists', 400);
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
        next(error);
    }
});

router.post('/login', validateUsername, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /login - Parameters:`, {
        username: req.body.username,
      password: req.body.password,
        passwordLength: req.body.password?.length || 0
    });

  

    try {
        const { username, password } = req.body;

              // Use findOneActive to exclude deleted users
        const user = await UserDB.findOneActive({ username });
        if (!user || user.password !== password) {
            throw new APIError('Invalid username or password', 401);
        }

        console.log(`[${timestamp}] Login successful for user: ${username}`);
        res.json({ 
            success: true,
            nickname: user.nickname,
            userId: user.userId
        });
    } catch (error) {
        next(error);
    }
});

router.get('/admin-url', (req, res) => {
    res.json({ url: process.env.MONGO_ADMIN_URL });
});

router.post('/logout', validateUserId, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /logout - Parameters:`, {
        userId : req.body.userId
    });

    try {
        const { userId } = req.body;
        const games = await GameStateDB.findAll();
        
        for (const game of games) {
            if (await GameStateDB.isPlayerInGame(game.id, userId)) {
                await GameStateDB.removePlayer(game.id, userId);
            }
        }
      
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.patch('/change-nickname', validateNickname, async (req, res, next) => {
    try {
        const { userId, nickname } = req.body;
      
        // Trim the nickname
        const trimmedNickname = validation.trim.nickname(nickname);
        
        if (!trimmedNickname) {
            throw new APIError('Nickname cannot be empty', 400);
        }

        // Update user's nickname
        await UserDB.update({ userId }, { nickname: trimmedNickname });

        // Update all chat messages from this user
        await ChatDB.update(
            { userId }, // Find all messages by this user
            { nickname: trimmedNickname } // Update their nickname
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});


// router.patch('/change-password', validateUsername, async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] PATCH /change-password - Username: ${req.body.username}`);

//     try {
//         const { username, currentPassword, newPassword } = req.body;
//         const user = await UserDB.findOne({ username });

//         if (!user || user.password !== currentPassword) {
//             throw new APIError('Current password is incorrect', 401);
//         }

//         await UserDB.update({ username }, { password: newPassword });
//         res.json({ success: true });
//     } catch (error) {
//         next(error);
//     }
// });

router.patch('/change-password', validateUserId, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PATCH /change-password - UserId: ${req.body.userId}`);

    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await UserDB.findById(userId);

        if (!user || user.password !== currentPassword) {
            throw new APIError('Current password is incorrect', 401);
        }

        await UserDB.updateById(userId, { password: newPassword });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/:userId', validateUserId, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.params.userId;
    console.log(`[${timestamp}] DELETE /${userId}`);

    try {
        const user = await UserDB.findById(userId);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        // Check for active games
        const games = await GameStateDB.findAll();
        const activeGames = games.filter(game => 
            game.creator === userId && 
            game.players.length > 0 &&
            game.players.some(player => player !== userId)
        );

        if (activeGames.length > 0) {
            throw new APIError(
                'Cannot delete account while you have active games with other players. Please delete your games first.',
                400
            );
        }

        // Soft delete the user
        await UserDB.softDelete(userId);

        // Remove from active games
        for (const game of games) {
            if (await GameStateDB.isPlayerInGame(game.id, userId)) {
                await GameStateDB.removePlayer(game.id, userId);
            }
        }

        // Update all chat messages from this user
        await ChatDB.markUserDeleted(userId);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export { router };
