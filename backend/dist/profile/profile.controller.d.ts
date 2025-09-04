import type { ProfileService } from "./profile.service";
import type { UpdateProfileDto } from "./dto/update-profile.dto";
import type { UpdateNumberDto } from "./dto/update-number.dto";
import type { VerifyUpdateNumberDto } from "./dto/verify-update-number.dto";
import type { VerifyDeleteProfileDto } from "./dto/verify-delete-profile.dto";
import type { UpdateLocationDto } from "./dto/update-location.dto";
import type { RegisterDeviceTokenDto } from "./dto/register-device-token.dto";
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<{
        id: unknown;
        name: string;
        phoneNumber: string;
        profilePic: string;
        bio: string;
        interests: string[];
        snooze: boolean;
    }>;
    updateProfilePhoto(req: any, file: any): Promise<{
        profilePic: string;
    }>;
    toggleSnooze(req: any, body: {
        snooze: boolean;
    }): Promise<{
        snooze: boolean;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        id: unknown;
        name: string;
        phoneNumber: string;
        profilePic: string;
        bio: string;
        interests: string[];
        snooze: boolean;
    }>;
    updateLocation(req: any, dto: UpdateLocationDto): Promise<{
        skipped: boolean;
        ok?: undefined;
    } | {
        ok: boolean;
        skipped?: undefined;
    }>;
    registerDeviceToken(req: any, dto: RegisterDeviceTokenDto): Promise<{
        ok: boolean;
        tokenType: string;
    } | {
        ok: boolean;
        tokenType?: undefined;
    }>;
    exportData(req: any): Promise<{
        profile: import("mongoose").FlattenMaps<import("./schemas/user-profile.schema").UserProfileDocument> & Required<{
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
        audits: (import("mongoose").FlattenMaps<import("../audit/schemas/audit-log.schema").AuditLogDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    clearData(req: any): Promise<{
        message: string;
    }>;
    requestDeleteProfileOtp(req: any): Promise<{
        message: string;
    }>;
    verifyDeleteProfile(req: any, dto: VerifyDeleteProfileDto): Promise<{
        message: string;
    }>;
    requestPhoneNumberUpdate(req: any, dto: UpdateNumberDto): Promise<{
        message: string;
    }>;
    verifyPhoneNumberUpdate(req: any, dto: VerifyUpdateNumberDto): Promise<{
        message: string;
        phoneNumber: string;
    }>;
    deleteProfile(): Promise<void>;
}
