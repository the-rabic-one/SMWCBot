import { Mutex, MutexInterface } from 'async-mutex';
import { Channel } from "../database/channels";
import { UpdateOptions } from 'sequelize/types';
import { LogService } from './Logs';

export class ChannelService {
    private mutex = new Mutex();

    private _channels: Channel[] = [];

    private static instance: ChannelService;

    static getInstance(): ChannelService {
        if(!this.instance) {
            this.instance = new ChannelService();
        }

        return this.instance;
    }

    private constructor() {
        this.initialize();
     }

     async initialize() {
        await Channel.findAll()
            .then((channels: Channel[]) => {
                LogService.getInstance().info(`Retrieved ${channels.length} channels from database.`);
                this._channels = channels;
            })
            .catch((err: Error) => {                  
                LogService.getInstance().error(`Error retrieving channel records from database: ${err.message}`, JSON.stringify(err));
            })
            .finally(() => {
            })

     }

    async create(name: string): Promise<Channel|undefined> {
           if(this.checkIfNameExists(name)) return;

            LogService.getInstance().info(`Creating channel record for: ${name}`);

            var channel!: Channel;
            try {
                channel = await Channel.create({name: name})
                if(channel) {
                        LogService.getInstance().info(`Channel record created successfully for ${name}`);
                        this._channels.push(channel);
                } 
            } catch(err) { }
            return channel;
    
     }

    checkIfNameExists(name: string): boolean {
         return this._channels.findIndex((c) => c.name == name) !== -1;
     }

    getByName(name: string): Channel {
        var channel!: Channel;
        const index = this._channels.findIndex((c) => c.name == name);
        if(index !== -1) {
            channel = this._channels[index];
        }
        return channel;
     }

     getAll(): Channel[] {
         return this._channels;
     }

     getAllActive(): Channel[] {
         return this._channels.filter((c) => c.active);
     }

     async update(channel: Channel): Promise<Boolean> {
         try {
            var c: Channel = await channel.save();
         } catch(err) {
             throw new Error(err);
         }

         return true;
     }
}