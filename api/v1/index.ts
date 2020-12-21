import express, { Request, Response } from 'express';
import { LogsRouter } from './logs.router';
import { ChatsRouter } from './chats.router';
import { ChannelsRouter } from './channels.router';
import { QueryRouter } from './queries.router';
export const ApiRouter = express.Router();

ApiRouter.use('/channels/', ChannelsRouter);
ApiRouter.use('/chats/', ChatsRouter);
ApiRouter.use('/logs/', LogsRouter);
ApiRouter.use('/queries', QueryRouter)