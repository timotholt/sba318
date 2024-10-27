export const api = {
    async register(username, password, nickname) {
        return this.sendRequest('/user/register', 'POST', { username, password, nickname });
    },

    async login(username, password) {
        return this.sendRequest('/user/login', 'POST', { username, password });
    },

    async logout(username) {
        return this.sendRequest('/user/logout', 'POST', { username });
    },

    async changePassword(username, currentPassword, newPassword) {
        return this.sendRequest('/user/change-password', 'POST', {
            username,
            currentPassword,
            newPassword
        });
    },

    async changeNickname(username, nickname) {
        return this.sendRequest('/user/change-nickname', 'POST', {
            username,
            nickname
        });
    },

    async deleteAccount(username) {
        return this.sendRequest('/user/delete-account', 'POST', { username });
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

    async leaveGame(gameId, username) {
    return this.sendRequest(`/lobby/${gameId}/leave`, 'POST', { username });
    },

    async getMongoAdminUrl() {
        return this.sendRequest('/user/admin-url', 'GET');
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