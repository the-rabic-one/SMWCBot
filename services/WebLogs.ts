import { WebLog, WebLogInterface } from "../database/weblogs";
import { LogService } from "./Logs";
import { FindAndCountOptions } from "sequelize/types";

export class WebLogService {
    private static instance: WebLogService;

    static getInstance(): WebLogService {
        if(!this.instance) {
            this.instance = new WebLogService();
        }
        return this.instance;
    }

    private constructor() { }

    create(wl: WebLogInterface) {
        LogService.getInstance().info(`Creating weblog record`);

        WebLog.create(wl)
            .then(() => LogService.getInstance().info(`Successfully created weblog record`))
            .catch((err: Error) => LogService.getInstance().error(`Error creating weblog record: ${err.message}`, JSON.stringify(err)));
    }

    async get(options?: FindAndCountOptions): Promise<{rows: WebLog[], count: number}> {
        var response = await WebLog.findAndCountAll(options);
        return response;
    }
}