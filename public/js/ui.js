export function showScreen(screens, screenName) {
    clearAllErrors();
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');

    const focusMap = {
        login: 'username',
        register: 'registerUsername',
        lobby: 'gameName',
        settings: 'currentNickname'
    };

    const inputToFocus = focusMap[screenName];
    if (inputToFocus) {
        document.getElementById(inputToFocus).focus();
    }
}

const errorContainers = {
    login: document.getElementById('loginError'),
    register: document.getElementById('registerError'),
    lobby: document.getElementById('lobbyError'),
    game: document.getElementById('gameError'),
    settings: document.getElementById('settingsError')
};

export function clearAllErrors() {
    Object.keys(errorContainers).forEach(key => {
        showError('', key);
    });
}

export function showError(message, screenName = 'login') {
    const errorDiv = errorContainers[screenName];
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = message ? 'block' : 'none';
        
        setTimeout(() => {
            if (message.includes('successfully')) {
                errorDiv.style.display = 'none';
            }
        }, 3000);
    }
}

export function renderGamesList(games, onDelete, onJoin) {
    const gamesListDiv = document.getElementById('gamesList');
    if (!gamesListDiv) return;

    gamesListDiv.innerHTML = games.length ? '' : '<p>No games available</p>';
    
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item';
        
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div class="game-header">
                <h3>${game.name}</h3>
                <span class="creator">Created by: ${game.creatorNickname}</span>
            </div>
            <div class="players-list">
                Players (${game.players.length}/${game.maxPlayers}): ${game.playerNicknames.join(', ')}
            </div>
        `;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'game-buttons';

        if (game.players.length < game.maxPlayers) {
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join Game';
            joinButton.className = 'join-btn';
            joinButton.onclick = () => onJoin(game.id);
            buttonsDiv.appendChild(joinButton);
        }
        
        if (game.creator === window.globalUsername) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️ Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => onDelete(game.id);
            buttonsDiv.appendChild(deleteButton);
        }
        
        gameElement.appendChild(gameInfo);
        gameElement.appendChild(buttonsDiv);
        gamesListDiv.appendChild(gameElement);
    });
}