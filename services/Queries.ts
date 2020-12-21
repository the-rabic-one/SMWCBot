import { QueryInterface, Query } from "../database/queries";
import Services from ".";
import { FindAndCountOptions } from "sequelize/types";

export class QueryService {
    private static instance: QueryService;

    static getInstance(): QueryService {
        if(!this.instance) {
            this.instance = new QueryService();
        }
        return this.instance;
    }

    private constructor() { }

    create(query: QueryInterface) {
        Query.create(query)
            .then(() => {})
            .catch((err: Error) => Services.Logs.error(`Unable to create Query: ${err.message}`, JSON.stringify(err)));
    }

    async get(options: FindAndCountOptions) {
        return await Query.findAndCountAll(options)
    }
}