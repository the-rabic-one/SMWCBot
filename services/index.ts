import { ChannelService } from "./Channels";
import { LogService } from "./Logs";
import { ChatService } from "./Chats";
import { WebLogService } from "./WebLogs";
import { QueryService } from "./Queries";

interface ServicesInterface {
    Channels: ChannelService,
    Logs: LogService,
    Chats: ChatService,
    Queries: QueryService,
    WebLogs: WebLogService
}

let logs = LogService.getInstance();
let channels = ChannelService.getInstance();
let chats = ChatService.getInstance();
let queries = QueryService.getInstance();
let weblogs = WebLogService.getInstance();

let services: ServicesInterface = {
    Channels: channels,
    Logs: logs,
    Chats: chats,
    Queries: queries,
    WebLogs: weblogs
}

export default services;