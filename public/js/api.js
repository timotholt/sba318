//=================================================
// I got into a lot of trouble when I had all the
// app and ui code making server calls directly, so
// I cominbed everything into api.js.
//=================================================


export const api = {
    async register(username, password, nickname) {
        const response = await this.sendRequest('/user/register', 'POST', { 
            username, 
            password, 
            nickname 
        });
        return response;
    },

    async login(username, password) {
        const response = await this.sendRequest('/user/login', 'POST', { 
            username, 
            password 
        });

        window.globalUserId = response.userId; // Store userId on successful login
        return response;
    },

    async logout(userId) {
        return this.sendRequest('/user/logout', 'POST', { userId });
    },

    async changePassword(userId, currentPassword, newPassword) {
        return this.sendRequest('/user/change-password', 'PATCH', {
            userId,
            currentPassword,
            newPassword
        });
    },

    async changeNickname(userId, nickname) {
        return this.sendRequest('/user/change-nickname', 'PATCH', {
            userId,
            nickname
        });
    },

    async deleteAccount(userId) {
        return this.sendRequest(`/user/${userId}`, 'DELETE');
    },

    async getGames(userId = null) {
        const url = userId ? `/lobby?userId=${userId}` : '/lobby';
        return this.sendRequest(url, 'GET');
    },
  
    // async createGame(name, creator) {
    //     return this.sendRequest('/lobby', 'POST', { 
    //         name, 
    //         creator // This is now userId
    //     });
    // },

    async createGame(name, creator, maxPlayers = 4, password = '') {
        return this.sendRequest('/lobby', 'POST', { 
            name, 
            creator,
            maxPlayers,
            password
        });
},
  
    async deleteGame(gameId, userId) {
        return this.sendRequest(`/lobby/${gameId}?userId=${userId}`, 'DELETE');
    },

    async joinGame(gameId, userId, password = '') {
    //   window.alert('API joinGame called with:', { gameId, userId, password });
      console.log('API joinGame called with:', { gameId, userId, password });
        return this.sendRequest(`/lobby/${gameId}/join`, 'POST', { userId, password });
    },

    async leaveGame(gameId, userId) {
        return this.sendRequest(`/lobby/${gameId}/leave`, 'POST', { userId });
    },

    async getLobbyChat() {
        return this.sendRequest(`/chat?type=lobby&userId=${window.globalUserId}`, 'GET');
    },

    async getGameChat(gameId) {
        return this.sendRequest(`/chat?type=game&gameId=${gameId}&userId=${window.globalUserId}`, 'GET');
    },

    // Add new method for public messages only
    async getPublicChat(type, gameId = null) {
        const url = type === 'lobby' 
            ? '/chat?type=lobby'
            : `/chat?type=game&gameId=${gameId}`;
        return this.sendRequest(url, 'GET');
    },

    async sendLobbyMessage(message) {
        return this.sendRequest('/chat', 'POST', {
            type: 'lobby',
            userId: window.globalUserId,
            message
        });
    },

    async sendGameMessage(gameId, message) {
        return this.sendRequest('/chat', 'POST', {
            type: 'game',
            gameId,
            userId: window.globalUserId,
            message
        });
    },

    async getMongoAdminUrl() {
        return this.sendRequest('/user/admin-url', 'GET');
    },

    async sendRequest(url, method = 'GET', data = null) {
        const serverStatus = document.getElementById('serverStatus');
        
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
            
            // Hide server status if request succeeds
            if (serverStatus) {
                serverStatus.style.display = 'none';
            }

            const result = await response.json();
            
            if (!response.ok) {
                throw { response: result };
            }
            
            return result;
        } catch (error) {
            // Show server status on connection error
            if (!error.response && serverStatus) {
                serverStatus.style.display = 'block';
            }
            
            if (error.response) {
                throw error;
            }
            
            console.error('API Error:', error);
            throw { response: { message: 'Server connection lost. Please try again later.' } };
        }
    }
};
