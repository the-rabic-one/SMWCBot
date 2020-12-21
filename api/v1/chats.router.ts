import express, { Request, Response } from 'express';
import Services from '../../services';
import { ChatInterface, Chat } from '../../database/chats';
import { FindAndCountOptions } from 'sequelize/types';
import * as Utils from '../../utils';

export const ChatsRouter = express.Router();

ChatsRouter.get('/', async (req: Request, res: Response) => {
    var offset = parseInt(req.query.offset as string, 10) || 0;
    var limit = parseInt(req.query.limit as string, 10) || 100;
    var type = (req.query.type || '').toString().toLowerCase().trim();
    var channel = (req.query.channel || '').toString().toLowerCase().trim();
    var username = (req.query.username || '').toString().toLowerCase().trim();

    var nolimit = Utils.getBoolean((req.query.nolimit || '').toString().toLowerCase().trim());

    var options: FindAndCountOptions = {};

    if(!nolimit) {
        options.offset = offset;
        options.limit = limit;
    }

    var where:any = {};

    if(['incoming', 'outgoing'].includes(type)) {
        where.type = type;
    }

    if(channel) {
        where.channel = channel;
    }

    if(username) {
        where.username = username;
    }

    options.where = where;

    var chats = await Services.Chats.get(options);
    res.json({data: Utils.buildRawAttributesFromArray(chats.rows), count: chats.count});
});