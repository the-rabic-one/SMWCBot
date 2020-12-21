import express, { Request, Response } from 'express';
import Services from '../../services';
import { FindAndCountOptions } from 'sequelize/types';
import { Log, LogInterface } from '../../database/logs';
import * as Utils from '../../utils';

export const LogsRouter = express.Router();

LogsRouter.get('/', async (req: Request, res: Response) => {
    var offset = parseInt(req.query.offset as string, 10) || 0;
    var limit = parseInt(req.query.limit as string, 10) || 100;
    var level = (req.query.level || '').toString().toLowerCase().trim();
    var nolimit = Utils.getBoolean((req.query.nolimit || '').toString().toLowerCase().trim());

    var options: FindAndCountOptions = {};

    if(!nolimit) {
        options.offset = offset;
        options.limit = limit;
    }

    if(['info', 'warn', 'error', 'debug'].includes(level)) {
        options.where = { level: level }
    }

    var logs = await Services.Logs.get(options);
    res.json({data: Utils.buildRawAttributesFromArray(logs.rows), count: logs.count});
});

