import { Chat } from "../database/chats";
import Services from './';
import { FindAndCountOptions } from "sequelize/types";

export class ChatService {

    private static instance: ChatService;

    static getInstance(): ChatService {
        if(!this.instance) {
            this.instance = new ChatService();
        }

        return this.instance;
    }

    private constructor() {}

    private create(type: string, channel: string, message: string, username?: string) {
        var options = {
            type: type,
            channel: channel,
            username: username,
            message: message
        };
        Chat.create(options)
            .then(() => {})
            .catch((err: Error) => Services.Logs.error(`Unable to create Chat: ${err.message}`, JSON.stringify(options)));
    }
    
    incoming(channel: string, username: string, message: string) {
        if(channel.indexOf('#'))
            channel = channel.slice(1);
            
        this.create('incoming', channel, message, username);
    }

    outgoing(channel: string, message: string) {
        this.create('outging', channel, message);
    }

    async get(options: FindAndCountOptions): Promise<{rows: Chat[], count: number}> {
        return await Chat.findAndCountAll(options)
    }
}