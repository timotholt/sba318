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
            joinButton.onclick = async () => onJoin(game.id);
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
    
    // Store current number of messages and scroll position
    const currentMessageCount = chatMessages.children.length;
    const wasScrolledToBottom = chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight;

    // Update messages
    chatMessages.innerHTML = messages.map(msg => `
        <div class="chat-message">
            <span class="chat-nickname ${msg.userId === '00000000-0000-0000-0000-000000000000' ? 'system-user' : ''}">${msg.nickname}:</span>
            ${msg.message}
            <span class="chat-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
    `).join('');

    // Only scroll to bottom if:
    // 1. We were already at the bottom OR
    // 2. There are new messages
    if (wasScrolledToBottom || messages.length > currentMessageCount) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

export function updateRefreshTimer(timeLeft) {
    const timerElement = document.getElementById('refreshTimer');
    if (timerElement) {
        timerElement.textContent = `Next refresh in ${timeLeft} second${timeLeft !== 1 ? 's' : ''}`;
    }
}

// Modal functions
export function showModal(title, content, onConfirm, onCancel) {
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="modal-cancel">Cancel</button>
                    <button class="modal-confirm">Confirm</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Get modal elements
    const modal = document.querySelector('.modal-overlay');
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');

    // Setup event listeners
    confirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal(modal);
    });

    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        closeModal(modal);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (onCancel) onCancel();
            closeModal(modal);
        }
    });

    // Focus first input if exists
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

function closeModal(modal) {
    modal.remove();
}

export function showCreateGameModal(onCreateGame) {
    const content = `
        <div class="form-group">
            <input type="text" id="modalGameName" placeholder="Game name">
            <input type="text" id="modalGamePassword" placeholder="Game password (optional)">
            <select id="modalMaxPlayers">
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
            </select>
        </div>
    `;

    showModal('Create Game', content, 
        () => {
            const name = document.getElementById('modalGameName').value.trim();
            const password = document.getElementById('modalGamePassword').value.trim();
            const maxPlayers = parseInt(document.getElementById('modalMaxPlayers').value);
            
            if (!name) {
                showError('Game name is required', 'lobby');
                return;
            }
            
            onCreateGame(name, password, maxPlayers);
        }
    );
}

export function showGetGamePasswordModal() {
    return new Promise((resolve, reject) => {
        const content = `
            <div class="form-group">
                <input type="text" id="modalGamePassword" placeholder="Enter game password">
            </div>
        `;

        showModal('Join Game', content,
            () => {
                const password = document.getElementById('modalGamePassword').value.trim();
                resolve(password);
            },
            () => reject(null) // User cancelled
        );
    });
}
