import type { Model } from "mongoose";
import type { ConfigService } from "@nestjs/config";
import type { UserProfileDocument } from "./schemas/user-profile.schema";
import type { UserAuthDocument } from "../auth/schemas/user-auth.schema";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { AuditLogDocument } from "../audit/schemas/audit-log.schema";
import type { NotificationsService } from "../notifications/notifications.service";
import type { OtpRateLimitService } from "../auth/otp-rate-limit.service";
export declare class ProfileService {
    private userProfileModel;
    private userAuthModel;
    private connectionModel;
    private connectionRequestModel;
    private reconRequestModel;
    private auditLogModel;
    private configService;
    private notificationsService;
    private otpRateLimit;
    private s3;
    private sns;
    constructor(userProfileModel: Model<UserProfileDocument>, userAuthModel: Model<UserAuthDocument>, connectionModel: Model<any>, connectionRequestModel: Model<any>, reconRequestModel: Model<any>, auditLogModel: Model<AuditLogDocument>, configService: ConfigService, notificationsService: NotificationsService, otpRateLimit: OtpRateLimitService);
    getProfile(profileId: string): Promise<{
        id: unknown;
        name: string;
        phoneNumber: string;
        profilePic: string;
        bio: string;
        interests: string[];
        snooze: boolean;
    }>;
    updateProfile(profileId: string, updateProfileDto: UpdateProfileDto): Promise<{
        id: unknown;
        name: string;
        phoneNumber: string;
        profilePic: string;
        bio: string;
        interests: string[];
        snooze: boolean;
    }>;
    updateProfilePhoto(profileId: string, file: any): Promise<{
        profilePic: string;
    }>;
    toggleSnooze(profileId: string, snooze: boolean): Promise<{
        snooze: boolean;
    }>;
    updateLocation(profileId: string, location: [number, number], accuracy?: number): Promise<{
        skipped: boolean;
        ok?: undefined;
    } | {
        ok: boolean;
        skipped?: undefined;
    }>;
    registerDeviceToken(profileId: string, token: string, platform: "ios" | "android", tokenType?: "expo" | "generic" | "sns"): Promise<{
        ok: boolean;
        tokenType: string;
    } | {
        ok: boolean;
        tokenType?: undefined;
    }>;
    deleteProfile(profileId: string, authId: string): Promise<{
        message: string;
    }>;
    clearData(profileId: string): Promise<{
        message: string;
    }>;
    exportData(profileId: string, authId: string): Promise<{
        profile: import("mongoose").FlattenMaps<UserProfileDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
        connections: (import("mongoose").FlattenMaps<any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        requests: (import("mongoose").FlattenMaps<any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pings: (import("mongoose").FlattenMaps<any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        audits: (import("mongoose").FlattenMaps<AuditLogDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    requestPhoneNumberUpdate(authId: string, newPhoneNumber: string): Promise<{
        message: string;
    }>;
    verifyPhoneNumberUpdate(authId: string, otp: string): Promise<{
        message: string;
        phoneNumber: string;
    }>;
    requestDeleteProfileOtp(authId: string): Promise<{
        message: string;
    }>;
    verifyAndDeleteProfile(profileId: string, authId: string, otp: string): Promise<{
        message: string;
    }>;
    private generateOtp;
    private uploadFileToS3;
    private getPlatformApplicationArn;
    private ensureSnsEndpoint;
    private calculateDistance;
    private deg2rad;
}
