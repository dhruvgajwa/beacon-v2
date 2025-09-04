import type { Model } from "mongoose";
import type { OtpLogDocument } from "./schemas/otp-log.schema";
export declare class OtpRateLimitService {
    private otpLogModel;
    constructor(otpLogModel: Model<OtpLogDocument>);
    private MAX_PER_WINDOW;
    private COOLDOWN_MS;
    assertCanSend(phoneNumber: string): Promise<void>;
    logSend(phoneNumber: string): Promise<void>;
}
