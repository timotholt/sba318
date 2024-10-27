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

      window.alert(`user id = ${response.userId}`);
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
  
    async createGame(name, creator) {
        return this.sendRequest('/lobby', 'POST', { 
            name, 
            creator // This is now userId
        });
    },

    async deleteGame(gameId, userId) {
        return this.sendRequest(`/lobby/${gameId}?userId=${userId}`, 'DELETE');
    },

    async joinGame(gameId, userId) {
        return this.sendRequest(`/lobby/${gameId}/join`, 'POST', { userId });
    },

    async leaveGame(gameId, userId) {
        return this.sendRequest(`/lobby/${gameId}/leave`, 'POST', { userId });
    },

    async getLobbyChat() {
        return this.sendRequest('/chat?type=lobby', 'GET');
    },

    async getGameChat(gameId) {
        return this.sendRequest(`/chat?type=game&gameId=${gameId}`, 'GET');
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

// export const api = {
//     async register(username, password, nickname) {
//         return this.sendRequest('/user/register', 'POST', { username, password, nickname });
//     },

//     async login(username, password) {
//         return this.sendRequest('/user/login', 'POST', { username, password });
//     },

//     async logout(username) {
//         return this.sendRequest('/user/logout', 'POST', { username });
//     },

//     async changePassword(username, currentPassword, newPassword) {
//         return this.sendRequest('/user/change-password', 'PATCH', {
//             username,
//             currentPassword,
//             newPassword
//         });
//     },

//     async changeNickname(username, nickname) {
//         return this.sendRequest('/user/change-nickname', 'PATCH', {
//             username,
//             nickname
//         });
//     },

//     async deleteAccount(username) {
//         return this.sendRequest(`/user/${username}`, 'DELETE');
//     },

//     async getGames(username = null) {
//       const url = username ? `/lobby?username=${username}` : '/lobby';
//       return this.sendRequest(url, 'GET');
//     },
  
//     async createGame(name, creator) {
//         return this.sendRequest('/lobby', 'POST', { name, creator });
//     },

//     async deleteGame(gameId, username) {
//         return this.sendRequest(`/lobby/${gameId}?username=${username}`, 'DELETE');
//     },

//     async joinGame(gameId, username) {
//         return this.sendRequest(`/lobby/${gameId}/join`, 'POST', { username });
//     },

//     async leaveGame(gameId, username) {
//     return this.sendRequest(`/lobby/${gameId}/leave`, 'POST', { username });
//     },

//   async getLobbyChat() {
//     return this.sendRequest('/chat?type=lobby', 'GET');
// },

// async getGameChat(gameId) {
//     return this.sendRequest(`/chat?type=game&gameId=${gameId}`, 'GET');
// },

// async sendLobbyMessage(message) {
//     return this.sendRequest('/chat', 'POST', {
//         type: 'lobby',
//         username: window.globalUsername,
//         message
//     });
// },

// async sendGameMessage(gameId, message) {
//     return this.sendRequest('/chat', 'POST', {
//         type: 'game',
//         gameId,
//         username: window.globalUsername,
//         message
//     });
// },

//     // async getAllMessages() {
//     // return this.sendRequest('/chat', 'GET');
//     // },

//     // async getUserMessages(username) {
//     // return this.sendRequest(`/chat?username=${username}`, 'GET');
//     // },

//     // async getGameMessages(gameId) {
//     // return this.sendRequest(`/chat?gameId=${gameId}`, 'GET');
//     // },

//     // async getUserGameMessages(username, gameId) {
//     // return this.sendRequest(`/chat?username=${username}&gameId=${gameId}`, 'GET');
//     // },

//     // async sendMessage(gameId, username, message) {
//     //   return this.sendRequest('/chat', 'POST', {
//     //       gameId,
//     //       username,
//     //       message
//     //   })
//     // },

//     async getMongoAdminUrl() {
//         return this.sendRequest('/user/admin-url', 'GET');
//     },

//     async sendRequest(url, method = 'GET', data = null) {
//         try {
//             const options = {
//                 method,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             };
            
//             if (data) {
//                 options.body = JSON.stringify(data);
//             }

//             const response = await fetch(url, options);
//             const result = await response.json();
            
//             if (!response.ok) {
//                 throw { response: result };
//             }
            
//             return result;
//         } catch (error) {
//             if (error.response) {
//                 throw error;
//             }
//             console.error('API Error:', error);
//             throw { response: { message: 'An unexpected error occurred' } };
//         }
//     }
// };