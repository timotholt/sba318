export function showScreen(screens, screenName) {
    clearAllErrors();
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');

    // Set focus on the appropriate input field for each screen
    const focusMap = {
        login: 'username',
        register: 'registerUsername',
        lobby: 'gameName'
    };

    const inputToFocus = focusMap[screenName];
    if (inputToFocus) {
        document.getElementById(inputToFocus).focus();
    }
}

// Get all error containers
const errorContainers = {
    login: document.getElementById('loginError'),
    register: document.getElementById('registerError'),
    lobby: document.getElementById('lobbyError'),
    game: document.getElementById(`gameError`)
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
        
        // Hide the error after 3 seconds
        setTimeout(() => {
//            errorDiv.style.display = 'none';
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
        gameInfo.textContent = `${game.name} (Created by: ${game.creator})`;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'game-buttons';

        const joinButton = document.createElement('button');
        joinButton.textContent = 'Join Game';
        joinButton.className = 'join-btn';
        joinButton.onclick = () => onJoin(game.id);
        
        if (game.creator === window.globalUsername) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️ Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => onDelete(game.id);
            buttonsDiv.appendChild(deleteButton);
        }
        
        buttonsDiv.appendChild(joinButton);
        gameElement.appendChild(gameInfo);
        gameElement.appendChild(buttonsDiv);
        gamesListDiv.appendChild(gameElement);
    });
}