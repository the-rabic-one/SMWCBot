import express, { response }  from "express";
import cors from 'cors';
import Services from "./services";
import { Server } from "http";
import { ApiRouter } from './api/v1/';
import { WebLogInterface, WebLog } from "./database/weblogs";
import * as Utils from './utils';

const PORT: number = 3000;

const app = express();

app.use(cors())
app.use(express.json());


app.use((request, response, next) => {
    const requestStart = Date.now();
    response.on('finish', () => {
        const { rawHeaders, httpVersion, method, socket, url } = request;
        const { remoteAddress, remoteFamily } = socket;

        var wb: WebLogInterface = {
            processingTime: (Date.now() - requestStart).toString(),
            rawHeaders: JSON.stringify(rawHeaders),
            httpVersion: httpVersion,
            method: method,
            remoteAddress: remoteAddress,
            remoteFamily: remoteFamily,
            url: url
        }

        var weblog = Services.WebLogs.create(wb);
        next();
    })
    next();
});

app.get('/', (request, response) => {
    response.send('Hello');
})

app.get('/weblogs', async (request, response) => {
    const weblogs: {rows: WebLog[], count: number } = await Services.WebLogs.get();
    var data = {data: Utils.buildRawAttributesFromArray(weblogs.rows), count: weblogs.count}
    response.json(data);
})

app.use('/api/', ApiRouter);

export function webapp(): Server { return app.listen(PORT, () => Services.Logs.info(`Webserver listening on port ${PORT}`)) }