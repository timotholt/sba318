// services/ChatCommandService.js
import { chatService } from './ChatService.js';
import { UserDB } from '../models/User.js';
import { APIError } from '../middleware/errorHandling.js';

class ChatCommandService {
    constructor() {
        if (ChatCommandService.instance) {
            return ChatCommandService.instance;
        }
        
        // Initialize commands map
        this.commands = new Map([
            ['help', {
                execute: this.helpCommand.bind(this),
                permission: 'all',
                help: 'Show available commands'
            }],
            ['nick', {
                execute: this.nickCommand.bind(this),
                permission: 'all',
                help: 'Change nickname: /nick <new_nickname>'
            }],
            ['msg', {
                execute: this.msgCommand.bind(this),
                permission: 'all',
                help: 'Send private message: /msg <user> <message>'
            }],
            ['kick', {
                execute: this.kickCommand.bind(this),
                permission: 'creator',
                help: 'Kick user from game: /kick <user>'
            }]
        ]);

        ChatCommandService.instance = this;
    }

    static getInstance() {
        if (!ChatCommandService.instance) {
            ChatCommandService.instance = new ChatCommandService();
        }
        return ChatCommandService.instance;
    }

    async processCommand(type, userId, message, gameId = null) {
        if (!message.startsWith('/')) {
            return false;
        }

        const [command, ...args] = message.slice(1).split(' ');
        const cmd = this.commands.get(command.toLowerCase());

        if (!cmd) {
            throw new APIError('Unknown command', 400);
        }

        await cmd.execute(type, userId, args, gameId);
        return true;
    }

    // Command implementations
    async helpCommand(type, userId, args, gameId) {
        const helpText = Array.from(this.commands.entries())
            .map(([name, cmd]) => `/${name} - ${cmd.help}`)
            .join('\n');
        
        await chatService.createMessage(
            type,
            userId,
            `Available commands:\n${helpText}`,
            gameId
        );
    }

    async nickCommand(type, userId, args, gameId) {
        const newNick = args[0];
        if (!newNick) {
            throw new APIError('New nickname required', 400);
        }

        const user = await UserDB.findById(userId);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        await UserDB.update({ userId }, { nickname: newNick });
        await chatService.updateUserNickname(userId, newNick);
    }

    // Add other command implementations...
}

export const chatCommandService = ChatCommandService.getInstance();
