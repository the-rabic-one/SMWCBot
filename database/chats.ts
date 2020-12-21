import { Sequelize, Model, DataTypes } from 'sequelize';
import { resolve } from 'path';
import { LogService } from '../services/Logs';

export class Chat extends Model {
    public id!: number;
    public type!: string;
    public channel!: string;
    public username!: string;
    public message!: string;
    public createdAt!: Date
}

export interface ChatInterface {
    id: number;
    type: string;
    channel: string;
    username?: string;
    message: string;
    createdAt: Date;
}

export const ChatFactory = async (sequelize: Sequelize) => {
        Chat.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                channel: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                username: {
                    type: DataTypes.STRING
                },
                message: {
                    type: DataTypes.TEXT
                }
            }, {
                tableName: 'chats',
                sequelize: sequelize,
                updatedAt: false
            }
        );

        await Chat.sync()
            .then(() => {})
            .catch((err: Error) => { LogService.getInstance().error('ERROR ', err.message); });
}
