import { api } from './api.js';
import { showScreen, showError, renderGamesList } from './ui.js';

window.globalUsername = '';

class GameApp {
    constructor() {
        this.screens = {};
        this.pollInterval = null;
        this.refreshTimer = null;
        this.pollDelay = 30000; // 30 seconds

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.screens = {
            login: document.getElementById('loginScreen'),
            register: document.getElementById('registerScreen'),
            lobby: document.getElementById('lobbyScreen'),
            game: document.getElementById('gameScreen')
        };
        
        this.setupEventListeners();
        showScreen(this.screens, 'login');
    }

    setupEventListeners() {
        // Registration
        document.getElementById('showRegisterButton').addEventListener('click', () => {
            showScreen(this.screens, 'register');
        });

        document.getElementById('showLoginButton').addEventListener('click', () => {
            showScreen(this.screens, 'login');
        });

        document.getElementById('registerButton').addEventListener('click', () => this.handleRegister());
        document.getElementById('registerUsername').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });

        // Login
        document.getElementById('loginButton').addEventListener('click', () => this.handleLogin());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Logout
        document.getElementById('logoutButton').addEventListener('click', () => this.handleLogout());

        // Game creation
        document.getElementById('createGameButton').addEventListener('click', () => this.createGame());
        document.getElementById('gameName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createGame();
        });

        // Back to lobby
        document.getElementById('backToLobbyButton').addEventListener('click', () => {
            showScreen(this.screens, 'lobby');
        });
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
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
            const response = await api.register(username, password);
            if (response?.success) {
                showScreen(this.screens, 'login');
                document.getElementById('registerUsername').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            }
        } catch (error) {
            showError('Registration failed. Please try again.', 'register');
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
                    this.stopPolling();
                    showScreen(this.screens, 'login');
                }
            }
        } catch (error) {
            showError('Logout failed. Please try again.', 'lobby');
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

            window.alert(`DeleteGame() username = ${window.globalUsername}`)
          
            const response = await api.deleteGame(gameId, window.globalUsername);
            if (response?.success) {
                this.updateGamesList();
            }
        } catch (error) {
            showError('Failed to delete game. Please try again.', 'lobby');
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

            // window.alert(`updateGamesList() username = ${username}`);
          
            renderGamesList(games, (gameId) => this.deleteGame(gameId));
        } catch (error) {
            console.error('Failed to update games list:', error);
        }
    }
}

// Initialize the app
new GameApp();