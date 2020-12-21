import { Log } from "../database/logs";
import { FindAndCountOptions } from "sequelize/types";

export class LogService {
    
    private static instance: LogService;

    static getInstance(): LogService {
        if(!this.instance) {
            this.instance = new LogService();
        }

        return this.instance;
    }
    
    private constructor() { this.info(`Logger initialized`) }

    private logger(level: string, message?: string, meta? :string) {
        Log.create({ level: level, message: message, meta: meta })
            .then(() => console.log(`${level}: ${message}`))
            .catch((err: Error) => console.error(`Database error while attempting to create log record: ${err.message}`, JSON.stringify(err)))
    }

    error(message: string, meta?: string) { this.logger('error', message, meta); }
    warn(message: string, meta?: string) { this.logger('warn', message, meta); }
    info(message: string, meta?: string) { this.logger('info', message, meta); }
    debug(message: string, meta?: string) { this.logger('debug', message, meta); }

    async get(options: FindAndCountOptions): Promise<{rows: Log[], count: number}>
    {
        return await Log.findAndCountAll(options)
    }
}