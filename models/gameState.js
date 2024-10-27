export const games = [];

export function clearGames() {
    games.length = 0;
}

export function addGame(game) {
    games.push(game);
}

export function removeGame(gameId) {
    const index = games.findIndex(g => g.id === gameId);
    if (index !== -1) {
        games.splice(index, 1);
        return true;
    }
    return false;
}