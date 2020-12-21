import TwitchJS, { ApiVersions, Message, Chat, Api, PrivateMessage } from 'twitch-js';

import { parseSMWCentralResultToString, SMWCentralResult, ResponseConfiguration, SMWCentral, SMWCentralRomHack } from './api/v1/SMWCentral';
import { BotConfiguration, BotConfigurationInterface } from './config';


import Services from './services/';
import { Channel } from './database/channels';
import { SMWCentralService } from './api/v1/SMWCentral.service';
import { QueryInterface } from './database/queries';
import { QueryService } from './services/Queries';


export class TwitchBot {
 
    config: BotConfigurationInterface;
    api!: Api;
    chat!: Chat;

    watchlist: string[] = [];

    command: string = 'hackinfo';

    botCommands: string[] = ['joinme', 'leaveme', 'show', 'hide'];
    adminBotCommands: string[] = ['uptime', 'watchlist'];
    ownerBotCommands: string[] = ['ping']

    smwcs: SMWCentralService;


    constructor() {
        this.config = BotConfiguration;

        this.botCommands.forEach((command) => { this.adminBotCommands.push(command); this.ownerBotCommands.push(command); });
        this.adminBotCommands.forEach((command) => this.ownerBotCommands.push(command));

        this.smwcs = new SMWCentralService();

        const token = this.config.twitch.token;
        const username = this.config.twitch.username;

        const { api, chat } = new TwitchJS({token, username})

        this.api = api;
        this.chat = chat;
        this.chat.connect().then(this.onChatConntect.bind(this));
    
        chat.on(TwitchJS.Chat.Events.PRIVATE_MESSAGE, message => this.onMessage(message))
    }

    private onChatConntect() {
        this.chat
            .join(this.config.twitch.username)
            .then(() => {
                Services.Logs.info(`Successfully joined channel: ${this.config.twitch.username}`);
                Services.Logs.info('Retrieving active channels from database');

                var channels = Services.Channels.getAll();

                if(!channels.length) {
                    Services.Logs.warn(`No channels to join`);
                    return;
                }

                Services.Logs.info(`Retrieved a total of ${channels.length} active channels`);
                Services.Logs.info(`Joining active channels`);

                channels.forEach((channel: Channel) => {
                    this.join(channel.name);
                });
            });
    }

    
    private isBotChannel(username: string, message: Message) {
        return (message.channel.toLowerCase() == '#' + username);
    }

    private join(name: string, successMsg?: string, errorMsg?: string) {
        Services.Logs.info(`Attempting to join channel named ${name}`);
            this.chat.join(name)
                .then(() => {
                    Services.Logs.info(`Successfully joined channel named ${name}`);
                    if(successMsg) this.say(this.config.twitch.username, successMsg);
                })
                .catch((err: Error) => {
                    Services.Logs.error(`An error occured while attempting to join channel named ${name}: ${err.message}`, JSON.stringify(err));
                    if(errorMsg) this.say(this.config.twitch.username, errorMsg);
                });
    }


    private say(channel: string, message: string) {
        this.chat.say(channel, message)
            .then(() => {
                Services.Chats.outgoing(channel, message);
            });
    }    

    private onMessage(message: Message) {
        if(message.message[0] !== '!') {
            return;
        }

        let params = message.message.slice(1).split(' ');
        let command = params.shift()?.toLowerCase() || '';
        let valid = false;

        if(this.isBotChannel(this.config.twitch.username, message)) {
            valid = this.botCommands.includes(command);
        }         

        if(valid) {
            Services.Chats.incoming(message.channel, message.username, message.message);

            var validShowHideParameters = [
                'category',
                'date',
                'exits'
            ];
            switch(command) {
                case 'joinme':
                    var successMsg = `${message.username}: I've now joined your channel.`;
                    var errorMsg = `${message.username}: There was an error joining your channel. Please try again later or contact an administrator.`;

                    Services.Logs.info(`User: ${message.username} requesting bot to join channel`);

                    var channel = Services.Channels.getByName(message.username);
                    if(!channel) {
                        Services.Channels.create(message.username)
                            .then(() => this.join(message.username, successMsg, errorMsg));
                    } else if(!channel.active) {
                        channel.active = true;
                        Services.Channels.update(channel)
                            .then(() => this.join(message.username, successMsg, errorMsg))
                            .catch((err) => this.say(this.config.twitch.username, 'test'))
                    }


                    break;

                case 'leaveme':
                    var successMsg = `${message.username}: This bot no longer watches your channel.`;
                    var errorMsg = `${message.username}: There was an error leaving your channel. Please try again later or contact an administrator.`;

                    var channel = Services.Channels.getByName(message.username);
                    if(channel && channel.active) {
                        channel.active = false;
                        Services.Channels.update(channel)
                            .then(() => this.join(message.username, successMsg, errorMsg))
                            .catch((err) => this.say(this.config.twitch.username, errorMsg))
                    } else {
                        this.say(this.config.twitch.username, `${message.username}: This bot was never watching your channel. No action taken.`);
                    }
                    break;

                case 'show':
                case 'hide':
                    if(params.length > 0) {
                        var parameter = params[0].toLowerCase();

                        if(validShowHideParameters.includes(parameter)) {
                            var channel = Services.Channels.getByName(message.username);
                            if(channel) {
                                var expectedValue = (command == 'hide') ? true : false;
                                var changed = false;

                                if(parameter == 'category') {
                                    if(channel.showCategory == expectedValue) {
                                        channel.showCategory = !expectedValue;
                                        changed = true;
                                    }
                                }

                                if(parameter == 'date') {
                                    if(channel.showDate == expectedValue) {
                                        channel.showDate = !expectedValue;
                                        changed = true;
                                    }
                                }

                                if(parameter == 'exits') {
                                    if(channel.showExits == expectedValue) {
                                        channel.showExits = !expectedValue;
                                        changed = true;
                                    }
                                }

                                if(changed) {
                                    Services.Channels.update(channel)
                                        .then(() => {
                                            this.say(this.config.twitch.username, `${message.username}: This bot will now ${command} information relating to ${parameter} in your channel.`);
                                        }).catch((err) => {
                                            Services.Logs.error(`Error updating channel for ${message.username} where ${parameter}=${!expectedValue}`);
                                        })
                                } else {
                                    this.say(this.config.twitch.username, `${message.username}: This bot already ${command}s information relating to ${parameter} in your channel. No action taken.`);
                                }
                            }
                        }
                    }
                    break;       
            }
        } else if(command == 'hackinfo') {
            Services.Chats.incoming(message.channel, message.username, message.message);
            var channel = Services.Channels.getByName(message.channel.slice(1));
            if(channel && channel.active) {
                var input = message.message.slice(1).split(' ').slice(1).join(' ');
                const results: SMWCentralResult = this.smwcs.query(input);
                const config: ResponseConfiguration = { showDate: channel.showDate, showDifficulty: channel.showCategory, showLength: channel.showExits};
                const response = parseSMWCentralResultToString(results, config);
                this.say(message.channel, `${message.username}: ${response}`);

                this.logQuery(message, input, results);
            }
        }
    }

    private logQuery(message: Message, input: string, results?: SMWCentralResult) {
        var query: QueryInterface = {
            channel: message.channel.slice(1),
            username: message.username,
            input: input
        }

        if(results?.result) {
            query.ratio = results.ratio;
            query.best = results.query;
            query.meta = JSON.stringify(results.result);
        }

        if(results?.result instanceof SMWCentralRomHack) {
            query.type = 'hack';
            query.result = results.result.getTitle();
        } else if(results?.result instanceof Array) {
            query.type = 'author';
            query.result = results.result.map((r) => r.getTitle()).join(', ');
        }

        Services.Queries.create(query);
    }
}
