import { DatabaseConfiguration } from '../config';
import { Sequelize, Options } from 'sequelize';

class DatabaseManager {
    private _db: Sequelize;

    public constructor() {
        const { database, username, password, host } = DatabaseConfiguration;
        var options: Options = {
            host: host,
            dialect: 'mysql',
            logging: true
        }
        this._db = new Sequelize(database, username, password, options);
     }

    getSequelize(): Sequelize {
        return this._db;
    }
}

export const SequelizeManager = new DatabaseManager();