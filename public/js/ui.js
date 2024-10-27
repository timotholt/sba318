export function showScreen(screens, screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
}

export function showError(message, screenName = 'login') {
    // Get all error containers
    const errorContainers = {
        login: document.getElementById('loginError'),
        register: document.getElementById('registerError'),
        lobby: document.getElementById('lobbyError'),
        game: document.getElementById(`gameError`)
    };

    // Show error in the appropriate container
    const errorDiv = errorContainers[screenName];
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide the error after 3 seconds
        setTimeout(() => {
//            errorDiv.style.display = 'none';
        }, 3000);
    }
}

export function renderGamesList(games, onDelete) {
    const gamesListDiv = document.getElementById('gamesList');
    if (!gamesListDiv) return;

    gamesListDiv.innerHTML = games.length ? '' : '<p>No games available</p>';
    
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item';
        
        const gameInfo = document.createElement('div');
        gameInfo.textContent = `${game.name} (Created by: ${game.creator})`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = `🗑️ Delete` + ` (${game.creator})`;
        deleteButton.onclick = () => onDelete(game.id);

      // window.alert(`currentUsername = ${currentUsername}`);
        
        // Only show delete button for games created by current user
        if (game.creator === window.globalUsername) {
            gameElement.appendChild(gameInfo);
            gameElement.appendChild(deleteButton);
        } else {
            gameElement.appendChild(gameInfo);
        }
        
        gamesListDiv.appendChild(gameElement);
    });
}
