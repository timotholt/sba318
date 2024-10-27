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
        passwordLength: req.body.password?.length || 0
    });

    try {
        const { username, password } = req.body;

        const user = await UserDB.findOne({ username });
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


router.patch('/change-password', validateUsername, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PATCH /change-password - Username: ${req.body.username}`);

    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await UserDB.findOne({ username });

        if (!user || user.password !== currentPassword) {
            throw new APIError('Current password is incorrect', 401);
        }

        await UserDB.update({ username }, { password: newPassword });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/:username', validateUsername, async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const username = req.params.username;
    console.log(`[${timestamp}] DELETE /${username}`);

    try {
        const user = await UserDB.findOne({ username });
        if (!user) {
            throw new APIError('User not found', 404);
        }

        const games = await GameStateDB.findAll();
        const activeGames = games.filter(game => 
            game.creator === username && 
            game.players.length > 0 &&
            game.players.some(player => player !== username)
        );

        if (activeGames.length > 0) {
            throw new APIError(
                'Cannot delete account while you have active games with other players. Please delete your games first.',
                400
            );
        }

        await GameStateDB.delete({ creator: username });

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

        // Update all chat messages from this user
        await ChatDB.update(
            { username: username },
            { 
                nickname: "Deleted User",
                username: "deleted_" + username
            }
        );

        const result = await UserDB.delete({ username });
        if (result.deletedCount === 0) {
            throw new APIError('User not found', 404);
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export { router };


// import express from 'express';
// import { validateUsername } from '../middleware/validation.js';
// import { UserDB } from '../models/User.js';
// import { GameStateDB } from '../models/GameState.js';
// import { ChatDB } from '../models/Chat.js';
// import { APIError } from '../middleware/errorHandling.js';
// import dotenv from 'dotenv';

// dotenv.config();
// const router = express.Router();

// router.post('/register', async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] POST /register - Parameters:`, { 
//         username: req.body.username,
//         nickname: req.body.nickname,
//         passwordLength: req.body.password?.length || 0
//     });

//     try {
//         const { username, password, nickname } = req.body;

//         if (!username || !password) {
//             throw new APIError('Username and password are required', 400);
//         }

//         const existingUser = await UserDB.findOne({ username });
//         if (existingUser) {
//             throw new APIError('Username already exists', 400);
//         }

//         await UserDB.create({ 
//             username, 
//             password,
//             nickname: nickname || username 
//         });
//         console.log(`[${timestamp}] Registration successful for user: ${username}`);

//         res.json({
//             success: true,
//             message: 'Registration successful'
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// router.post('/login', validateUsername, async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] POST /login - Parameters:`, {
//         username: req.body.username,
//         passwordLength: req.body.password?.length || 0
//     });

//     try {
//         const { username, password } = req.body;

//         const user = await UserDB.findOne({ username });
//         if (!user || user.password !== password) {
//             throw new APIError('Invalid username or password', 401);
//         }

//         console.log(`[${timestamp}] Login successful for user: ${username}`);
//         res.json({ 
//             success: true,
//             nickname: user.nickname 
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// router.get('/admin-url', (req, res) => {
//     res.json({ url: process.env.MONGO_ADMIN_URL });
// });

// router.post('/logout', validateUsername, async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] POST /logout - Parameters:`, {
//         username: req.body.username
//     });

//     try {
//         const { username } = req.body;
//         const games = await GameStateDB.findAll();
        
//         for (const game of games) {
//             if (game.players.includes(username)) {
//                 game.players = game.players.filter(p => p !== username);
//                 await GameStateDB.update({ id: game.id }, { players: game.players });
//             }
//         }
        
//         console.log(`[${timestamp}] Logout successful for user: ${username}`);
//         res.json({ success: true });
//     } catch (error) {
//         next(error);
//     }
// });

// router.patch('/change-nickname', validateUsername, async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] PATCH /change-nickname - Username: ${req.body.username}`);

//     try {
//         const { username, nickname } = req.body;
//         if (!nickname || nickname.trim().length === 0) {
//             throw new APIError('Nickname cannot be empty', 400);
//         }

//         await UserDB.update({ username }, { nickname: nickname.trim() });
//         res.json({ success: true });
//     } catch (error) {
//         next(error);
//     }
// });

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

// router.delete('/:username', validateUsername, async (req, res, next) => {
//     const timestamp = new Date().toISOString();
//     const username = req.params.username;
//     console.log(`[${timestamp}] DELETE /${username}`);

//     try {
//         const user = await UserDB.findOne({ username });
//         if (!user) {
//             throw new APIError('User not found', 404);
//         }

//         const games = await GameStateDB.findAll();
//         const activeGames = games.filter(game => 
//             game.creator === username && 
//             game.players.length > 0 &&
//             game.players.some(player => player !== username)
//         );

//         if (activeGames.length > 0) {
//             throw new APIError(
//                 'Cannot delete account while you have active games with other players. Please delete your games first.',
//                 400
//             );
//         }

//         await GameStateDB.delete({ creator: username });

//         for (const game of games) {
//             const playerIndex = game.players.indexOf(username);
//             if (playerIndex !== -1) {
//                 game.players.splice(playerIndex, 1);
//                 game.playerNicknames.splice(playerIndex, 1);
//                 await GameStateDB.update({ id: game.id }, { 
//                     players: game.players,
//                     playerNicknames: game.playerNicknames 
//                 });
//             }
//         }

//         // Update all chat messages from this user
//         await ChatDB.update(
//             { username: username },
//             { 
//                 nickname: "Deleted User",
//                 username: "deleted_" + username
//             }
//         );

//         const result = await UserDB.delete({ username });
//         if (result.deletedCount === 0) {
//             throw new APIError('User not found', 404);
//         }

//         res.json({ success: true });
//     } catch (error) {
//         next(error);
//     }
// });


// // import express from 'express';
// // import { validateUsername } from '../middleware/validation.js';
// // import { UserDB } from '../models/User.js';
// // import { GameStateDB } from '../models/GameState.js';
// // import { ChatDB } from '../models/Chat.js';
// // import { APIError } from '../middleware/errorHandling.js';
// // import dotenv from 'dotenv';

// // dotenv.config();
// // const router = express.Router();

// // router.post('/register', async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     console.log(`[${timestamp}] POST /register - Parameters:`, { 
// //         username: req.body.username,
// //         nickname: req.body.nickname,
// //         passwordLength: req.body.password?.length || 0
// //     });

// //     try {
// //         const { username, password, nickname } = req.body;

// //         if (!username || !password) {
// //             throw new APIError('Username and password are required', 400);
// //         }

// //         const existingUser = await UserDB.findOne({ username });
// //         if (existingUser) {
// //             throw new APIError('Username already exists', 400);
// //         }

// //         await UserDB.create({ 
// //             username, 
// //             password,
// //             nickname: nickname || username 
// //         });
// //         console.log(`[${timestamp}] Registration successful for user: ${username}`);

// //         res.json({
// //             success: true,
// //             message: 'Registration successful'
// //         });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // router.post('/login', validateUsername, async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     console.log(`[${timestamp}] POST /login - Parameters:`, {
// //         username: req.body.username,
// //         passwordLength: req.body.password?.length || 0
// //     });

// //     try {
// //         const { username, password } = req.body;

// //         const user = await UserDB.findOne({ username });
// //         if (!user || user.password !== password) {
// //             throw new APIError('Invalid username or password', 401);
// //         }

// //         console.log(`[${timestamp}] Login successful for user: ${username}`);
// //         res.json({ 
// //             success: true,
// //             nickname: user.nickname 
// //         });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // router.get('/admin-url', (req, res) => {
// //     res.json({ url: process.env.MONGO_ADMIN_URL });
// // });

// // router.post('/logout', validateUsername, async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     console.log(`[${timestamp}] POST /logout - Parameters:`, {
// //         username: req.body.username
// //     });

// //     try {
// //         const { username } = req.body;
// //         const games = await GameStateDB.findAll();
        
// //         for (const game of games) {
// //             if (game.players.includes(username)) {
// //                 game.players = game.players.filter(p => p !== username);
// //                 await GameStateDB.update({ id: game.id }, { players: game.players });
// //             }
// //         }
        
// //         console.log(`[${timestamp}] Logout successful for user: ${username}`);
// //         res.json({ success: true });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // router.patch('/change-nickname', validateUsername, async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     console.log(`[${timestamp}] PATCH /change-nickname - Username: ${req.body.username}`);

// //     try {
// //         const { username, nickname } = req.body;
// //         if (!nickname || nickname.trim().length === 0) {
// //             throw new APIError('Nickname cannot be empty', 400);
// //         }

// //         await UserDB.update({ username }, { nickname: nickname.trim() });
// //         res.json({ success: true });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // router.patch('/change-password', validateUsername, async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     console.log(`[${timestamp}] PATCH /change-password - Username: ${req.body.username}`);

// //     try {
// //         const { username, currentPassword, newPassword } = req.body;
// //         const user = await UserDB.findOne({ username });

// //         if (!user || user.password !== currentPassword) {
// //             throw new APIError('Current password is incorrect', 401);
// //         }

// //         await UserDB.update({ username }, { password: newPassword });
// //         res.json({ success: true });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // router.delete('/:username', validateUsername, async (req, res, next) => {
// //     const timestamp = new Date().toISOString();
// //     const username = req.params.username;
// //     console.log(`[${timestamp}] DELETE /${username}`);

// //     try {
// //         // First check if user exists
// //         const user = await UserDB.findOne({ username });
// //         if (!user) {
// //             throw new APIError('User not found', 404);
// //         }

// //         // Find any games they created that have active players
// //         const games = await GameStateDB.findAll();
// //         const activeGames = games.filter(game => 
// //             game.creator === username && 
// //             game.players.length > 0 &&
// //             game.players.some(player => player !== username)
// //         );

// //         if (activeGames.length > 0) {
// //             throw new APIError(
// //                 'Cannot delete account while you have active games with other players. Please delete your games first.',
// //                 400
// //             );
// //         }

// //         // Update all chat messages from this user
// //         await ChatDB.update(
// //             { username: username },
// //             { 
// //                 nickname: "Deleted User",
// //                 username: "deleted_" + username
// //             }
// //         );

// //         // Delete all games they created (should be empty now)
// //         await GameStateDB.delete({ creator: username });

// //         // Remove them from any games they joined
// //         for (const game of games) {
// //             const playerIndex = game.players.indexOf(username);
// //             if (playerIndex !== -1) {
// //                 game.players.splice(playerIndex, 1);
// //                 game.playerNicknames.splice(playerIndex, 1);
// //                 await GameStateDB.update({ id: game.id }, { 
// //                     players: game.players,
// //                     playerNicknames: game.playerNicknames 
// //                 });
// //             }
// //         }

// //         // Finally delete the user
// //         const result = await UserDB.delete({ username });
// //         if (result.deletedCount === 0) {
// //             throw new APIError('User not found', 404);
// //         }

// //         res.json({ success: true });
// //     } catch (error) {
// //         next(error);
// //     }
// // });

// // export { router };
