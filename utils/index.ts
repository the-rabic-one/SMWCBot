import { Chat, ChatInterface } from "../database/chats";
import { WebLog, WebLogInterface } from "../database/weblogs";
import { Channel, ChannelInterface } from "../database/channels";
import { Log, LogInterface } from "../database/logs";
import { Query, QueryInterface } from "../database/queries";

export function buildRawAttributes(a: Channel | Chat | Log | Query | WebLog): ChannelInterface | ChatInterface | LogInterface | QueryInterface | WebLogInterface {
    if(a instanceof Channel) {
        var channel = a as Channel;
        return {
            id: channel.id,
            name: channel.name,
            active: channel.active,
            showCategory: channel.showCategory,
            showDate: channel.showDate,
            showExits: channel.showExits,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt
        }
    } else if(a instanceof Chat) {
        var chat = a as Chat;
        return {
            id: chat.id,
            type: chat.type,
            channel: chat.channel,
            username: chat.username,
            message: chat.message,
            createdAt: chat.createdAt
        }
    } else if(a instanceof Log) {
        var log = a as Log;
        return {
            id: log.id,
            level: log.level,
            message: log.message,
            meta: log.meta,
            createdAt: log.createdAt
        }
    } else if(a instanceof Query) {
        var query = a as Query;
        return {
            id: query.id,
            channel: query.channel,
            username: query.username,
            input: query.input,
            best: query.best,
            ratio: query.ratio,
            type: query.type,
            result: query.result,
            meta: query.meta,
            createdAt: query.createdAt
        }
    } else if(a instanceof WebLog) {
        var weblog = a as WebLog;
        return {
            id: weblog.id,
            processingTime: weblog.processingTime,
            rawHeaders: weblog.rawHeaders,
            httpVersion: weblog.httpVersion,
            method: weblog.method,
            remoteAddress: weblog.remoteAddress,
            remoteFamily: weblog.remoteFamily,
            url: weblog.url,
            createdAt: weblog.createdAt
        }
    }

    throw Error('Invalid');
}

export function buildRawAttributesFromArray(array: Channel[] | Chat[] | Log[] | Query[] | WebLog[]) {
    var data: (ChannelInterface | ChatInterface | LogInterface | QueryInterface | WebLogInterface)[] = [];
    if(array && array.length) {
        array.forEach((a: Channel | Chat | Log | Query | WebLog) => {
            data.push(buildRawAttributes(a))
        });
    }
    return data;
}

export function getBoolean(s: string): boolean | undefined {
    switch(s) {
        case 'true':
        case '1':
        case 'yes':
            return true;
        case 'false':
        case '0':
        case 'no':
            return false;
        default:
            return;
    }
}