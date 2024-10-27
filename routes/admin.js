import express from 'express';
import { GameStateDB } from '../models/GameState.js';
import { UserDB } from '../models/User.js';

const router = express.Router();

// Helper function to calculate stats
function calculateStats(games, users) {
    const activeGames = games.filter(game => game.players.length > 0);
    const totalPlayers = new Set(games.flatMap(game => game.players)).size;
    
    // Calculate most active creator
    const creatorCounts = {};
    games.forEach(game => {
        creatorCounts[game.creator] = (creatorCounts[game.creator] || 0) + 1;
    });
    const mostActiveCreator = Object.entries(creatorCounts)
        .sort(([,a], [,b]) => b - a)[0];

    return {
        totalUsers: users.length,
        totalGames: games.length,
        activeGames: activeGames.length,
        totalPlayers,
        averagePlayersPerGame: games.length ? 
            (games.reduce((sum, game) => sum + game.players.length, 0) / games.length).toFixed(1) : 0,
        mostActiveCreator: mostActiveCreator ? {
            username: mostActiveCreator[0],
            games: mostActiveCreator[1]
        } : null
    };
}

// Main dashboard view
router.get('/dashboard', async (req, res, next) => {
    try {
        const minPlayers = req.query.minPlayers;
        const games = await GameStateDB.findAll();
        const users = await UserDB.findAll();
        const stats = calculateStats(games, users);

        // Filter and sort games
        let filteredGames = [...games];
        if (minPlayers) {
            filteredGames = filteredGames.filter(game => 
                game.players.length >= parseInt(minPlayers)
            );
        }

        const sortedGames = filteredGames.sort((a, b) => {
            if (b.players.length !== a.players.length) {
                return b.players.length - a.players.length;
            }
            return new Date(b.created) - new Date(a.created);
        });

        res.render('admin/dashboard', { 
            stats, 
            games: sortedGames,
            users,
            moment: new Date(),
            minPlayers: minPlayers || ''
        });
    } catch (error) {
        next(error);
    }
});

// Server-Sent Events endpoint for real-time updates
router.get('/dashboard/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = async () => {
        try {
            const games = await GameStateDB.findAll();
            const users = await UserDB.findAll();
            const stats = calculateStats(games, users);
            
            // Sort games like in the dashboard route
            const sortedGames = [...games].sort((a, b) => {
                if (b.players.length !== a.players.length) {
                    return b.players.length - a.players.length;
                }
                return new Date(b.created) - new Date(a.created);
            });

            res.write(`data: ${JSON.stringify({
                stats,
                games: sortedGames,
                users: users.slice(-10), // Last 10 users
                timestamp: new Date()
            })}\n\n`);
        } catch (error) {
            console.error('Error sending SSE update:', error);
        }
    };

    const interval = setInterval(sendUpdate, 5000);
    
    req.on('close', () => {
        clearInterval(interval);
    });
});

export { router };