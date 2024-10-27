export const api = {
    async register(username, password) {
        return this.sendRequest('/player/register', 'POST', { username, password });
    },

    async login(username, password) {
        return this.sendRequest('/player/login', 'POST', { username, password });
    },

    async logout(username) {
        return this.sendRequest('/player/logout', 'POST', { username });
    },

    async getGames() {
        return this.sendRequest('/game', 'GET');
    },

    async createGame(name, creator) {
        return this.sendRequest('/game', 'POST', { name, creator });
    },

    async deleteGame(gameId, username) {
        return this.sendRequest(`/game/${gameId}?username=${username}`, 'DELETE');
    },

    async sendRequest(url, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};