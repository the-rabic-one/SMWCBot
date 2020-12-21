export interface TwitchConfigurationInterface {
    username: string;
    token: string;
}

export interface DatabaseConfigurationInterface {
    database: string;
    username: string;
    password: string;
    host: string;
    dialect: string;
}

export interface BotConfigurationInterface {
    owner: string;
    administrators: string[];
}

const environment = (process.env.environment == 'dev')? 'dev':'prod';

export const TwitchConfiguration: TwitchConfigurationInterface = {
    username: process.env.TWITCH_USERNAME || '',
    token: process.env.TWITCH_TOKEN || ''
}

export const DatabaseConfiguration: DatabaseConfigurationInterface = {
    database: process.env.DATABASE_SCHEMA || '',
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
    host: process.env.DATABASE_HOST || '',
    dialect: process.env.DATABASE_DIALECT || ''
}

export interface BotConfigurationInterface {
    twitch: TwitchConfigurationInterface;
    owner: string;
    administrators: string[];
}

export const BotConfiguration: BotConfigurationInterface = {
    twitch: TwitchConfiguration,
    owner: process.env.BOT_OWNER || '',
    administrators: (process.env.BOT_ADMINISTRATORS || '').split(',')
}

