import crypto from 'crypto';
import { UserDB } from './User.js';
import { chatService } from '../services/ChatService.js';

// System messages have a special UUID (0), cause it makes life easier!
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
const SYSTEM_USERNAME = 'system';
const SYSTEM_NICKNAME = '<system>';

export class SystemMessages {
    static async initialize() {
        // Create system user if it doesn't exist
        const systemUser = await UserDB.findById(SYSTEM_USER_ID);
        if (!systemUser) {
            await UserDB.create({
                userId: SYSTEM_USER_ID,
                username: SYSTEM_USERNAME,
                nickname: SYSTEM_NICKNAME,
                password: crypto.randomUUID(), // Random password since it's never used
            });
        }
    }

    static async broadcastToLobby(message) {
        return await chatService.createMessage(
            'lobby',
            SYSTEM_USER_ID,
            message
        );
    }

    static async broadcastToGame(gameId, message) {
        return await chatService.createMessage(
            'game',
            SYSTEM_USER_ID,
            message,
            gameId
        );
    }

    // Pre-defined message helpers
    static async userJoined(gameId, nickname) {
        return this.broadcastToGame(gameId, `${nickname} joined the game`);
    }

    static async userLeft(gameId, nickname) {
        return this.broadcastToGame(gameId, `${nickname} left the game`);
    }

    static async userLoggedIn(nickname) {
        return this.broadcastToLobby(`${nickname} logged in`);
    }

    static async userLoggedOut(nickname) {
        return this.broadcastToLobby(`${nickname} logged out`);
    }

    static async serverShutdown(minutes) {
        return this.broadcastToLobby(`⚠️ Server shutting down in ${minutes} minutes`);
    }

    static async serverMaintenance(message) {
        return this.broadcastToLobby(`🔧 ${message}`);
    }

    static async gameCreated(gameName, creatorNickname) {
        return this.broadcastToLobby(`${creatorNickname} created game "${gameName}"`);
    }

    static async gameDeleted(gameName, creatorNickname) {
        return this.broadcastToLobby(`${creatorNickname} deleted game "${gameName}"`);
    }

    static async userDeleted(nickname) {
        return this.broadcastToLobby(`${nickname} deleted their account`);
    }

    static async nicknameChanged(oldNickname, newNickname) {
        return this.broadcastToLobby(`${oldNickname} changed their nickname to ${newNickname}`);
    }

    static async serverStarted() {
        return this.broadcastToLobby(`🟢 Server started`);
    }

    static async serverStopping() {
        return this.broadcastToLobby(`🔴 Server stopping...`);
    }

    static async kickedFromGame(gameId, nickname, reason) {
        return this.broadcastToGame(gameId, `${nickname} was kicked from the game${reason ? `: ${reason}` : ''}`);
    }

    static async gameStarted(gameId) {
        return this.broadcastToGame(gameId, `🎮 Game started!`);
    }

    static async gameEnded(gameId) {
        return this.broadcastToGame(gameId, `🏁 Game ended`);
    }

    static async systemError(message) {
        return this.broadcastToLobby(`❌ System Error: ${message}`);
    }

    static async systemWarning(message) {
        return this.broadcastToLobby(`⚠️ Warning: ${message}`);
    }

    static async systemInfo(message) {
        return this.broadcastToLobby(`ℹ️ ${message}`);
    }
}
