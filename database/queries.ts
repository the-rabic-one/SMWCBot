import { Model, Sequelize, DataTypes } from "sequelize";
import sequelize from "sequelize";
import { LogService } from "../services/Logs";

export class Query extends Model {
    public id!: number;
    public channel!: string;
    public username!: string;

    public input!: string;

    public best!: string;
    public ratio!: number;

    public type!: string;
    public result!: string;
    public meta!: string;

    public readonly createdAt!: Date;
}

export interface QueryInterface {
    id?: number;
    channel: string;
    username: string;

    input: string;

    best?: string;
    ratio?: number;

    type?: string;
    result?: string;
    meta?: string;

    createdAt?: Date;
}

export const QueryFactory = async (sequelize: Sequelize) => {
    Query.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            channel: {
                type: DataTypes.STRING,
                allowNull: false
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            input: DataTypes.STRING,
            best: DataTypes.STRING,
            ratio: DataTypes.DOUBLE,
            type: DataTypes.STRING,
            result: DataTypes.STRING,
            meta: DataTypes.TEXT
        }, {
            sequelize: sequelize,
            tableName: 'queries'
        }
    )

    await Query.sync()
        .then(() => { })
        .catch((err: Error) => { LogService.getInstance().error(`Error: ${err.message}`) })
}