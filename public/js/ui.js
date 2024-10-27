
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

    // This should never fail unless the HTML is broken
    const gamesListDiv = document.getElementById('gamesList');
    if (!gamesListDiv) return;

    // If there are no games, display that message
    gamesListDiv.innerHTML = games.length ? '' : '  No games available';

    // Otherwise, loop through the games returned from the server
    games.forEach(game => {

        // A game element contains a game info section and the join and delete buttons
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item';

        // The game info is the name of the game/creator/time
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';

        // Get creator's nickname from the user list
        const creatorNickname = game.creatorNickname || 'Unknown User';

        // Add the actual game information to the new child element
        gameInfo.innerHTML = `
            <div class="game-header">
                <h3>${game.name}</h3>
                <span class="creator">Created by: ${creatorNickname}</span>
            </div>
            <div class="players-list">
                Players (${game.players.length}/${game.maxPlayers})
            </div>
        `;

        // Figure out what buttons we need to add to the name of the game
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'game-buttons';

        // Only show join button if game isn't full
        if (game.players.length < game.maxPlayers) {
            const joinButton = document.createElement('button');
            joinButton.textContent = 'Join';
            joinButton.className = 'join-btn';
            joinButton.onclick = () => onJoin(game.id);
            buttonsDiv.appendChild(joinButton);
        }
        
        // Only show delete button if current user is the creator
        if (game.creator === window.globalUserId) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => onDelete(game.id);
            buttonsDiv.appendChild(deleteButton);
        }

        // Add all of it to the DOM
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

