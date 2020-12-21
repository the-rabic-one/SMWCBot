import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import { SequelizeManager } from './';
import { ChannelService } from '../services/Channels';
import { LogService } from '../services/Logs';

export class Channel extends Model {
    public id!: number;
    public name!: string;
    public active!: boolean;

    public showDate!: boolean;
    public showExits!: boolean;
    public showCategory!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export interface ChannelInterface {
    id: number;
    name: string;
    active: boolean;

    showDate: boolean;
    showExits: boolean;
    showCategory: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const ChannelFactory = async (sequelize: Sequelize) => {
        Channel.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false
                },
                active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                },
                showDate: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                },
                showExits: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                },
                showCategory: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                }
            },
            {
                tableName: 'channels',
                sequelize: SequelizeManager.getSequelize()
            }
        );

        await Channel.sync()
            .then(() => { })
            .catch((err: Error) => { LogService.getInstance().error("ERROR", err.message); });
}