import { Sequelize, Model, DataTypes } from 'sequelize';

export class Log extends Model {
    public id!: number;
    public level!: string;
    public message!: string;
    public meta!: string;

    public readonly createdAt!: Date;
}

export interface LogInterface {
    id: number;
    level: string;
    message: string;
    meta?: string;

    createdAt: Date;
}

export const LogFactory = (sequelize: Sequelize): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        Log.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true
                },
                level: {
                    type: DataTypes.STRING(15),
                    allowNull: false,
                    defaultValue: ''
                },
                message: {
                    type: DataTypes.TEXT
                },
                meta: {
                    type: DataTypes.TEXT
                }
            }, {
                tableName: 'logs',
                sequelize: sequelize,
                updatedAt: false
            }
        );

        Log.sync()
            .then(() => resolve(true))
            .catch((err: Error) => reject(err) );
    });
}

