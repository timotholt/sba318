import { api } from './api.js';
import { showScreen, showError, renderGamesList, clearAllErrors } from './ui.js';

window.globalUsername = '';
window.globalNickname = '';

class GameApp {
    constructor() {
        this.screens = {
            login: document.getElementById('loginScreen'),
            register: document.getElementById('registerScreen'),
            lobby: document.getElementById('lobbyScreen'),
            game: document.getElementById('gameScreen'),
            settings: document.getElementById('settingsScreen')
        };
        
        this.pollInterval = null;
        this.refreshTimer = null;
        this.pollDelay = 30000; // 30 seconds

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.setupEventListeners();
        showScreen(this.screens, 'login');
    }

    setupEventListeners() {
        document.getElementById('showRegisterButton').addEventListener('click', () => {
            showScreen(this.screens, 'register');
        });

        document.getElementById('showLoginButton').addEventListener('click', () => {
            showScreen(this.screens, 'login');
        });

        document.getElementById('registerButton').addEventListener('click', () => this.handleRegister());
        
        ['registerUsername', 'registerNickname', 'registerPassword', 'confirmPassword'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleRegister();
            });
        });

        document.getElementById('loginButton').addEventListener('click', () => this.handleLogin());
        
        ['username', 'password'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        });

        document.getElementById('adminLink').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await api.getMongoAdminUrl();
                if (response.url) {
                    window.open(response.url, '_blank');
                }
            } catch (error) {
                showError('Could not open admin interface', 'login');
            }
        });

        document.getElementById('logoutButton').addEventListener('click', () => this.handleLogout());

        document.getElementById('createGameButton').addEventListener('click', () => this.createGame());
        document.getElementById('gameName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createGame();
        });

        document.getElementById('settingsButton').addEventListener('click', () => {
            document.getElementById('currentNickname').value = window.globalNickname;
            showScreen(this.screens, 'settings');
        });

        document.getElementById('backToLobbyFromSettings').addEventListener('click', () => {
            showScreen(this.screens, 'lobby');
        });

        document.getElementById('changeNicknameButton').addEventListener('click', () => this.handleChangeNickname());
        document.getElementById('changePasswordButton').addEventListener('click', () => this.handleChangePassword());
        document.getElementById('deleteAccountButton').addEventListener('click', () => this.handleDeleteAccount());

        document.getElementById('backToLobbyButton').addEventListener('click', async () => {
            try {
                // We need to store the current game ID when joining a game
                await api.leaveGame(this.currentGameId, window.globalUsername);
                showScreen(this.screens, 'lobby');
                this.updateGamesList(); // Refresh the games list
            } catch (error) {
                showError('Failed to leave game', 'game');
              showError('Failed to leave game', 'lobby');
            }
        });
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const nickname = document.getElementById('registerNickname').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !password) {
            showError('Please enter both username and password', 'register');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match', 'register');
            return;
        }

        try {
            const response = await api.register(username, password, nickname);
            if (response?.success) {
                document.getElementById('registerUsername').value = '';
                document.getElementById('registerNickname').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                showScreen(this.screens, 'login');
            }
        } catch (error) {
            const errorMessage = error.response?.message || 'Registration failed. Please try again.';
            showError(errorMessage, 'register');
        }
    }
    
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Please enter both username and password', 'login');
            return;
        }

        try {
            const response = await api.login(username, password);
            if (response?.success) {
                window.globalUsername = username;
                window.globalNickname = response.nickname || username;
                clearAllErrors();
                showScreen(this.screens, 'lobby');
                this.startPolling();
            }
        } catch (error) {
            showError('Login failed. Please try again.', 'login');
        }
    }

    async handleLogout() {
        try {
            if (window.globalUsername) {
                const response = await api.logout(window.globalUsername);
                if (response?.success) {
                    window.globalUsername = '';
                    window.globalNickname = '';
                    clearAllErrors();
                    this.stopPolling();
                    showScreen(this.screens, 'login');
                }
            }
        } catch (error) {
            showError('Logout failed. Please try again.', 'lobby');
        }
    }

    async handleChangeNickname() {
        const nickname = document.getElementById('currentNickname').value.trim();
        
        if (!nickname) {
            showError('Please enter a nickname', 'settings');
            return;
        }

        try {
            const response = await api.changeNickname(window.globalUsername, nickname);
            if (response?.success) {
                window.globalNickname = nickname;
                showError('Nickname updated successfully!', 'settings');
            }
        } catch (error) {
            showError(error.response?.message || 'Failed to update nickname', 'settings');
        }
    }

    async handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showError('All fields are required', 'settings');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showError('New passwords do not match', 'settings');
            return;
        }

        try {
            const response = await api.changePassword(window.globalUsername, currentPassword, newPassword);
            if (response?.success) {
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
                showError('Password changed successfully!', 'settings');
            }
        } catch (error) {
            showError(error.response?.message || 'Failed to change password', 'settings');
        }
    }

    async handleDeleteAccount() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await api.deleteAccount(window.globalUsername);
            if (response?.success) {
                window.globalUsername = '';
                window.globalNickname = '';
                this.stopPolling();
                showScreen(this.screens, 'login');
            }
        } catch (error) {
            showError('Failed to delete account', 'settings');
        }
    }
    
    async createGame() {
        const gameNameInput = document.getElementById('gameName');
        const gameName = gameNameInput.value.trim();
        
        if (!gameName) {
            showError('Please enter a game name', 'lobby');
            return;
        }

        try {
            const response = await api.createGame(gameName, window.globalUsername);
            if (response?.success) {
                gameNameInput.value = '';
                this.updateGamesList();
            }
        } catch (error) {
            showError('Failed to create game. Please try again.', 'lobby');
        }
    }
    
    async deleteGame(gameId) {
        try {
            const response = await api.deleteGame(gameId, window.globalUsername);
            if (response?.success) {
                this.updateGamesList();
            }
        } catch (error) {
            showError('Failed to delete game. Please try again.', 'lobby');
        }
    }

    async joinGame(gameId) {
        try {
            const response = await api.joinGame(gameId, window.globalUsername);
            if (response?.success) {
                this.currentGameId = gameId; // Add this line to store the game ID
                showScreen(this.screens, 'game');
            }
        } catch (error) {
            showError('Failed to join game. Please try again.', 'lobby');
        }
    }
    
    startPolling() {
        this.stopPolling();
        this.updateGamesList();
        this.pollInterval = setInterval(() => this.updateGamesList(), this.pollDelay);
        this.startRefreshTimer();
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    startRefreshTimer() {
        const timerElement = document.getElementById('refreshTimer');
        let timeLeft = this.pollDelay / 1000;

        const updateTimer = () => {
            timerElement.textContent = `Next refresh in ${timeLeft} second${timeLeft !== 1 ? 's' : ''}`;
            timeLeft--;

            if (timeLeft < 0) {
                timeLeft = this.pollDelay / 1000;
            }
        };

        updateTimer();
        this.refreshTimer = setInterval(updateTimer, 1000);
    }
    
    async updateGamesList() {
        try {
            const games = await api.getGames();
            renderGamesList(
                games,
                (gameId) => this.deleteGame(gameId),
                (gameId) => this.joinGame(gameId)
            );
        } catch (error) {
            console.error('Failed to update games list:', error);
        }
    }
}

new GameApp();