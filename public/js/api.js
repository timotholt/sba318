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
        return this.sendRequest('/lobby', 'GET');
    },

    async createGame(name, creator) {
        return this.sendRequest('/lobby', 'POST', { name, creator });
    },

    async deleteGame(gameId, username) {
        return this.sendRequest(`/lobby/${gameId}?username=${username}`, 'DELETE');
    },

    async joinGame(gameId, username) {
        return this.sendRequest(`/lobby/${gameId}/join`, 'POST', { username });
    },

    async getMongoAdminUrl() {
        return this.sendRequest('/player/admin-url', 'GET');
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
            const result = await response.json();
            
            if (!response.ok) {
                throw { response: result };
            }
            
            return result;
        } catch (error) {
            if (error.response) {
                throw error;
            }
            console.error('API Error:', error);
            throw { response: { message: 'An unexpected error occurred' } };
        }
    }
};