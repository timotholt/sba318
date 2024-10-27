
// This code is how we switch screens.  We actually hide
// and unhide one of the 4 divs in the index.html
export function showScreen(screens, screenName) {
    clearAllErrors();
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');

    // After we show the screen, move the cursor
    // to the specified input field.
    const focusMap = {

        // The left side is the screen name, the right side is the <tag>
        login:    'username',
        register: 'registerUsername',
        lobby:    'gameName',
        settings: 'currentNickname'
    };

    const inputToFocus = focusMap[screenName];
    if (inputToFocus) {
        document.getElementById(inputToFocus).focus();
    }
}

// Error code goes here
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
        errorDiv.classList.remove('fade-out');
        
        if (message) {
            // Start fade after 7 seconds (total 10s with animation)
            setTimeout(() => {
                errorDiv.classList.add('fade-out');
                // Hide completely after fade animation
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                    errorDiv.classList.remove('fade-out');
                }, 3000);
            }, 7000);
        }
    }
}

export function renderGamesList(games, onDelete, onJoin) {
    const gamesListDiv = document.getElementById('gamesList');
    if (!gamesListDiv) return;

    gamesListDiv.innerHTML = games.length ? '' : '  No games available';

    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item';

        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';

        const creatorNickname = game.creatorNickname || 'Unknown User';

        gameInfo.innerHTML = `
            <div class="game-header">
                <h3>${game.name}</h3>
            </div>
            <div class="game-details">
                <span class="creator">Created by: ${creatorNickname}</span>
                <span class="players-list">Players (${game.players.length}/${game.maxPlayers})</span>
            </div>
        `;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'game-buttons';

        if (game.players.length < game.maxPlayers) {
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.className = 'join-btn';
            joinButton.onclick = () => onJoin(game.id);
            buttonsDiv.appendChild(joinButton);
        }
        
        if (game.creator === window.globalUserId) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => onDelete(game.id);
            buttonsDiv.appendChild(deleteButton);
        }

        gameElement.appendChild(gameInfo);
        gameElement.appendChild(buttonsDiv);
        gamesListDiv.appendChild(gameElement);
    });
}

export function renderChatMessages(messages, containerId) {
    const chatMessages = document.getElementById(containerId);
    if (!chatMessages) return;

    // Sort messages by timestamp in ascending order (oldest first)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    chatMessages.innerHTML = sortedMessages.map(msg => `
        <div class="chat-message">
            <span class="chat-nickname">${msg.nickname}:</span>
            ${msg.message}
            <span class="chat-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
    `).join('');

    // Scroll to bottom to show newest messages
    // chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function updateRefreshTimer(timeLeft) {
    const timerElement = document.getElementById('refreshTimer');
    if (timerElement) {
        timerElement.textContent = `Next refresh in ${timeLeft} second${timeLeft !== 1 ? 's' : ''}`;
    }
}

