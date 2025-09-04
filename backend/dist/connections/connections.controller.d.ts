import type { SendConnectionRequestDto } from "./dto/send-connection-request.dto";
import type { LookupContactsDto } from "./dto/lookup-contacts.dto";
import type { ConfigService } from "@nestjs/config";
export declare class ConnectionsController {
    private readonly connectionsService;
    private readonly config;
    constructor(connectionsService: any, config: ConfigService);
    getConnections(): Promise<any>;
    getConnectionRequests(): Promise<any>;
    sendConnectionRequest(sendConnectionRequestDto: SendConnectionRequestDto): Promise<any>;
    acceptConnectionRequest(requestId: string): Promise<any>;
    rejectConnectionRequest(requestId: string): Promise<any>;
    lookupContacts(body: LookupContactsDto): Promise<any>;
    updateConnectionType(connectionId: string, body: {
        connectionType: number;
    }): Promise<any>;
    createInviteLink(): Promise<any>;
    acceptInvite(body: {
        token: string;
    }): Promise<any>;
    invite(body: {
        phoneNumber: string;
        sendSms?: boolean;
        sendWhatsApp?: boolean;
    }): Promise<{
        link: string;
        token: any;
        sentSms: boolean;
        sentWhatsApp: boolean;
    }>;
    sendConnectionRequestAlias(body: SendConnectionRequestDto): Promise<any>;
    acceptConnectionRequestAlias(requestId: string): Promise<any>;
    rejectConnectionRequestAlias(requestId: string): Promise<any>;
    private getRequest;
}
