import * as dotenv from 'dotenv';
dotenv.config();

import { SequelizeManager } from './database';
import { ChannelFactory, Channel } from './database/channels';
import { LogFactory } from './database/logs';

import { ChatFactory } from './database/chats';
import { TwitchBot } from './bot';
import { ChannelService } from './services/Channels';
import { webapp } from './app';
import { Server } from 'http';
import { WebLogFactory } from './database/weblogs';
import { QueryFactory } from './database/queries';

var server: Server;

SequelizeManager
  .getSequelize()
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    LogFactory(SequelizeManager.getSequelize())
       .then((b) => {
          Promise.all([ChannelFactory(SequelizeManager.getSequelize()), ChatFactory(SequelizeManager.getSequelize()), WebLogFactory(SequelizeManager.getSequelize()), QueryFactory(SequelizeManager.getSequelize())])
            .then(() => {
              ChannelService.getInstance().initialize().then(() => {
                let bot: TwitchBot = new TwitchBot();
                server = webapp();
              })
            });
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database: ', err)
  })
});



/**
 * Webpack HMR Activation
 */

type ModuleId = string | number;

interface WebpackHotModule {
  hot?: {
    data: any;
    accept(
      dependencies: string[],
      callback?: (updatedDependencies: ModuleId[]) => void,
    ): void;
    accept(dependency: string, callback?: () => void): void;
    accept(errHandler?: (err: Error) => void): void;
    dispose(callback: (data: any) => void): void;
  };
}

declare const module: WebpackHotModule;

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => { if(server) server.close()})
}


