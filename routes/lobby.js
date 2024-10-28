import express from 'express';
import { GameStateDB } from '../models/GameState.js';
import { UserDB } from '../models/User.js';
import { ChatDB } from '../models/Chat.js';
import { APIError } from '../middleware/errorHandling.js';
import { SystemMessages } from '../models/SystemMessages.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/', async (req, res, next) => {
    const userId = req.query.userId;
    
    try {
        const games = await GameStateDB.findAll();
        
        const filteredGames = userId 
            ? games.filter(game => 
                game.creator === userId || 
                game.players.some(player => player.userId === userId)
              )
            : games;

const gamesWithCreatorInfo = await Promise.all(filteredGames.map(async game => {
    const creator = await UserDB.findById(game.creator);
    
    // // Also fetch player nicknames
    // const players = await Promise.all(game.players.map(async playerId => {
    //     const player = await UserDB.findById(playerId);
    //     return {
    //         userId: playerId,
    //         nickname: player ? player.nickname : 'Unknown Player'
    //     };
    // }));
    
    return {
        ...game,
        creatorNickname: creator ? creator.nickname : 'Unknown User',
    };
}));
        
        console.log(`Total games: ${gamesWithCreatorInfo.length}`);
        res.json(gamesWithCreatorInfo);
    } catch (error) {
        next(error);
    }
});

// router.post('/', async (req, res, next) => {
//     try {
//         const { name, creator, maxPlayers } = req.body;
        
//         if (!name || !creator) {
//             throw new APIError('Game name and creator are required', 400);
//         }

//         const maxPlayersNum = parseInt(maxPlayers) || 4;
//         if (maxPlayersNum < 1 || maxPlayersNum > 4) {
//             throw new APIError('Max players must be between 1 and 4', 400);
//         }

//         const existingGame = await GameStateDB.findOne({ name: name });
//         if (existingGame) {
//             throw new APIError('A game with this name already exists', 400);
//         }

//         const creatorUser = await UserDB.findById(creator);
//         if (!creatorUser) {
//             throw new APIError('Creator not found', 404);
//         }

//         const newGame = await GameStateDB.create({
//             name,
//             creator: creatorUser.userId,
//             maxPlayers: maxPlayersNum,
//             players: []
//         });

//         // Send system message about game creation
//         await SystemMessages.gameCreated(name, creatorUser.nickname);

//         res.json({ success: true, game: newGame });
//     } catch (error) {
//         next(error);
//     }
// });

// routes/lobby.js - in the POST / route
router.post('/', async (req, res, next) => {
    try {
        const { name, creator, maxPlayers, password } = req.body;
        
        if (!name || !creator) {
            throw new APIError('Game name and creator are required', 400);
        }

        const maxPlayersNum = parseInt(maxPlayers) || 4;
        if (maxPlayersNum < 1 || maxPlayersNum > 4) {
            throw new APIError('Max players must be between 1 and 4', 400);
        }

        const existingGame = await GameStateDB.findOne({ name: name });
        if (existingGame) {
            throw new APIError('A game with this name already exists', 400);
        }

        const creatorUser = await UserDB.findById(creator);
        if (!creatorUser) {
            throw new APIError('Creator not found', 404);
        }

        const newGame = await GameStateDB.create({
            name,
            creator: creatorUser.userId,
            maxPlayers: maxPlayersNum,
            password: password || '',
            players: []
        });

        res.json({ success: true, game: newGame });
    } catch (error) {
        next(error);
    }
});

// Update the join route to check password
router.post('/:id/join', async (req, res, next) => {
    const { userId, password } = req.body;
    const { id } = req.params;

    try {
        const game = await GameStateDB.findOne({ id });
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        // If game has password but none provided, notify client
        if (game.password && !password) {
            return res.json({ needsPassword: true });
        }

        // Check password if game has one
        if (game.password && game.password !== password) {
            throw new APIError('Incorrect password', 401);
        }

        // See if the user is a valid user!
        const joiningUser = await UserDB.findById(userId);
        if (!joiningUser) {
            throw new APIError('User not found', 404);
        }

        // TODO: Need to check if we are at the maximum # of players

        const updatedGame = await GameStateDB.addPlayer(id, userId);
        if (!updatedGame) {
            throw new APIError('Failed to join game', 500);
        }

        res.json({ success: true, game: updatedGame });
    } catch (error) {
        next(error);
    }
});

// router.post('/:id/join', async (req, res, next) => {
//     const { userId } = req.body;
//     const { id } = req.params;

//     try {
//         const game = await GameStateDB.findOne({ id });
//         if (!game) {
//             throw new APIError('Game not found', 404);
//         }

//         const joiningUser = await UserDB.findById(userId);
//         if (!joiningUser) {
//             throw new APIError('User not found', 404);
//         }

//         // First join the game
//         const updatedGame = await GameStateDB.addPlayer(id, userId);
//         if (!updatedGame) {
//             throw new APIError('Failed to join game', 500);
//         }

//         // Then send the system message after successful join
//         await SystemMessages.userJoined(id, joiningUser.nickname);

//         res.json({ success: true, game: updatedGame });
//     } catch (error) {
//         next(error);
//     }
// });


router.post('/:id/leave', async (req, res, next) => {
    const { userId } = req.body;
    const { id } = req.params;

    try {
        const game = await GameStateDB.findOne({ id });
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        const leavingUser = await UserDB.findById(userId);
        if (!leavingUser) {
            throw new APIError('User not found', 404);
        }

        if (!await GameStateDB.isPlayerInGame(id, userId)) {
            throw new APIError('User not in game', 400);
        }

        // Send system message before removing player
        await SystemMessages.userLeft(id, leavingUser.nickname);

        const updatedGame = await GameStateDB.removePlayer(id, userId);
        if (!updatedGame) {
            throw new APIError('Failed to leave game', 500);
        }

        res.json({ success: true, game: updatedGame });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    const userId = req.query.userId;
    
    try {
        if (!userId) {
            throw new APIError('User ID is required', 400);
        }

        const { id } = req.params;
        const game = await GameStateDB.findOne({ id });
        
        if (!game) {
            throw new APIError('Game not found', 404);
        }

        if (game.creator !== userId) {
            throw new APIError('Only the creator can delete the game', 403);
        }

        const creator = await UserDB.findById(userId);
        if (!creator) {
            throw new APIError('Creator not found', 404);
        }

        // Send system message before deleting
        await SystemMessages.gameDeleted(game.name, creator.nickname);

        await GameStateDB.delete({ id });
        await ChatDB.deleteByGame(id);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export { router };