import type { Model } from "mongoose";
import type { UserProfileDocument } from "../profile/schemas/user-profile.schema";
import type { ReconRequestDocument } from "./schemas/recon-request.schema";
import type { ConnectionDocument } from "../connections/schemas/connection.schema";
import type { NotificationsService } from "../notifications/notifications.service";
import type { ReconDto } from "./dto/recon.dto";
export declare class ReconService {
    private userProfileModel;
    private reconRequestModel;
    private connectionModel;
    private notificationsService;
    constructor(userProfileModel: Model<UserProfileDocument>, reconRequestModel: Model<ReconRequestDocument>, connectionModel: Model<ConnectionDocument>, notificationsService: NotificationsService);
    recon(userId: string, reconDto: ReconDto): Promise<{
        nearbyUsers: {
            id: unknown;
            distance: number;
            canSeeProfile: boolean;
            name: string;
            profilePic: string;
        }[];
    }>;
    ping(fromId: string, toId: string): Promise<{
        message: string;
        requestId: unknown;
    }>;
    acceptPing(userId: string, requestId: string): Promise<{
        message: string;
    }>;
    rejectPing(userId: string, requestId: string): Promise<{
        message: string;
    }>;
    getPingRequests(userId: string): Promise<{
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
    private calculateDistance;
    private deg2rad;
}
