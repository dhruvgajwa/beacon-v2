import type { ConfigService } from "@nestjs/config";
type TokenType = "expo" | "generic" | "sns";
export declare class NotificationsService {
    private readonly config;
    private readonly logger;
    private sns;
    private expoPushEnabled;
    private snsRegion;
    constructor(config: ConfigService);
    sendPushNotification(token: string, title: string, body: string, data?: Record<string, any>, tokenType?: TokenType): Promise<{
        ok: boolean;
        messageId: string;
    } | {
        ok: boolean;
    }>;
    private sendSnsPush;
    sendSms(phoneNumber: string, message: string): Promise<{
        ok: boolean;
        messageId: string;
    } | {
        ok: boolean;
        messageId?: undefined;
    }>;
    sendOtp(phoneNumber: string, otp: string, purpose: "signup" | "login" | "update_number" | "delete_account"): Promise<{
        ok: boolean;
        messageId: string;
    } | {
        ok: boolean;
        messageId?: undefined;
    }>;
}
export {};
