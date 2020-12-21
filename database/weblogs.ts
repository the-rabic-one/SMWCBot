import { Sequelize, Model, DataTypes } from 'sequelize';

export class WebLog extends Model {
    public id!: number;
    public processingTime!: string;
    public rawHeaders!: string;
    public httpVersion!: string;
    public method!: string;
    public remoteAddress!: string;
    public remoteFamily!: string;
    public url!: string;

    public readonly createdAt!: Date;
}

export class WebLogInterface {
    processingTime!: string;
    rawHeaders!: string;
    httpVersion!: string;
    method!: string;
    remoteAddress!: string | undefined;
    remoteFamily!: string | undefined;
    url!: string;
    createdAt?: Date
}

export const WebLogFactory = (sequelize: Sequelize): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        WebLog.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            processingTime: { type: DataTypes.STRING },
            rawHeaders: { type: DataTypes.TEXT },
            httpVersion: { type: DataTypes.STRING },
            method: { type: DataTypes.STRING },
            remoteAddress: { type: DataTypes.STRING },
            remoteFamily: { type: DataTypes.STRING },
            url: { type: DataTypes.STRING },
        }, {
            tableName: 'weblogs',
            sequelize: sequelize,
            updatedAt: false
        });

        WebLog.sync()
            .then(() => resolve(true))
            .catch((err: Error) => reject(err));
    })
}