import type { Model } from "mongoose";
import type { ConnectionDocument } from "./schemas/connection.schema";
import type { ConnectionRequestDocument } from "./schemas/connection-request.schema";
import type { UserProfileDocument } from "../profile/schemas/user-profile.schema";
import type { NotificationsService } from "../notifications/notifications.service";
import type { SendConnectionRequestDto } from "./dto/send-connection-request.dto";
import type { InviteTokenDocument } from "./schemas/invite-token.schema";
export declare class ConnectionsService {
    private connectionModel;
    private connectionRequestModel;
    private userProfileModel;
    private inviteTokenModel;
    private notificationsService;
    constructor(connectionModel: Model<ConnectionDocument>, connectionRequestModel: Model<ConnectionRequestDocument>, userProfileModel: Model<UserProfileDocument>, inviteTokenModel: Model<InviteTokenDocument>, notificationsService: NotificationsService);
    getConnections(userId: string): Promise<{
        connections: {
            id: unknown;
            name: string;
            phoneNumber: string;
            profilePic: string;
            connectionType: number;
        }[];
    }>;
    getConnectionRequests(userId: string): Promise<{
        requests: {
            id: unknown;
            from: {
                id: unknown;
                name: string;
                phoneNumber: string;
                profilePic: string;
            };
            createdAt: Date;
        }[];
    }>;
    sendConnectionRequest(fromId: string, sendConnectionRequestDto: SendConnectionRequestDto): Promise<{
        message: string;
        requestId: unknown;
    }>;
    acceptConnectionRequest(userId: string, requestId: string): Promise<{
        message: string;
        connectionId: unknown;
    }>;
    rejectConnectionRequest(userId: string, requestId: string): Promise<{
        message: string;
    }>;
    updateConnectionType(userId: string, connectionId: string, connectionType: number): Promise<{
        message: string;
        connectionType: number;
    }>;
    createInviteLink(inviterId: string): Promise<{
        token: string;
    }>;
    acceptInviteToken(inviteeId: string, token: string): Promise<{
        message: string;
    }>;
    lookupContacts(fromId: string, phoneNumbers: string[]): Promise<{
        results: ({
            phoneNumber: string;
            status: "not_registered";
        } | {
            phoneNumber: string;
            status: "connected";
        } | {
            phoneNumber: string;
            status: "pending_outgoing";
        } | {
            phoneNumber: string;
            status: "pending_incoming";
        } | {
            phoneNumber: string;
            status: "available";
        })[];
    }>;
    sendSmsInvite(phoneNumber: string, message: string): Promise<{
        ok: boolean;
        messageId: string;
    } | {
        ok: boolean;
        messageId?: undefined;
    }>;
    sendWhatsAppInvite(phoneNumber: string, message: string): Promise<{
        ok: boolean;
        messageId: string;
    } | {
        ok: boolean;
        messageId?: undefined;
    }>;
}
