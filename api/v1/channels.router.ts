import express, { Request, Response } from 'express';
import Services from '../../services';
import { ChannelInterface, Channel } from '../../database/channels';
import * as Utils from '../../utils';
import { Resolver } from 'dns';

export const ChannelsRouter = express.Router();


ChannelsRouter.get('/', async (req: Request, res: Response) => {
    var name = (req.query.name as string || '').trim().toLowerCase();
    var active = Utils.getBoolean((req.query.active as string || '').trim().toLowerCase())
    var showCategory = Utils.getBoolean((req.query.showCategory as string || '').trim().toLowerCase());
    var showDate = Utils.getBoolean((req.query.showDate as string || '').trim().toLowerCase());
    var showExits = Utils.getBoolean((req.query.showExits as string || '').trim().toLowerCase());
    

    var channels = Services.Channels.getAll();
    
    if(name) { channels = channels.filter((channel) => channel.name == name )};
    if(active != undefined) { channels = channels.filter((channel) => channel.active == active) }
    if(showCategory != undefined) { channels = channels.filter((channel) => channel.showCategory == showCategory) }
    if(showDate != undefined) { channels = channels.filter((channel) => channel.showDate == showDate) }
    if(showExits != undefined) { channels = channels.filter((channel) => channel.showExits == showExits) }
    
    res.json(Utils.buildRawAttributesFromArray(channels));
});