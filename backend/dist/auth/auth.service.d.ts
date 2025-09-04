import type { Model } from "mongoose";
import type { JwtService } from "@nestjs/jwt";
import type { UserAuthDocument } from "./schemas/user-auth.schema";
import type { UserProfileDocument } from "../profile/schemas/user-profile.schema";
import type { SignupDto } from "./dto/signup.dto";
import type { LoginDto } from "./dto/login.dto";
import type { VerifyOtpDto } from "./dto/verify-otp.dto";
import type { NotificationsService } from "../notifications/notifications.service";
import type { OtpRateLimitService } from "./otp-rate-limit.service";
import type { ConfigService } from "@nestjs/config";
export declare class AuthService {
    private userAuthModel;
    private userProfileModel;
    private jwtService;
    private notificationsService;
    private otpRateLimit;
    private configService;
    constructor(userAuthModel: Model<UserAuthDocument>, userProfileModel: Model<UserProfileDocument>, jwtService: JwtService, notificationsService: NotificationsService, otpRateLimit: OtpRateLimitService, configService: ConfigService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        userId: unknown;
    }>;
    verifyOtpSignup(verifyOtpDto: VerifyOtpDto): Promise<{
        token: string;
        user: {
            id: unknown;
            name: string;
            phoneNumber: string;
            profilePic: string;
            snooze: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        userId: unknown;
    }>;
    verifyOtpLogin(verifyOtpDto: VerifyOtpDto): Promise<{
        token: string;
        user: {
            id: unknown;
            name: string;
            phoneNumber: string;
            profilePic: string;
            snooze: boolean;
        };
    }>;
    resendOtp(phoneNumber: string, type: "signup" | "login"): Promise<{
        message: string;
        userId: unknown;
    }>;
    private generateOtp;
    validateUser(userId: string): Promise<any>;
    verifyMsg91Token(msg91Token: string, name?: string): Promise<{
        token: string;
        user: {
            id: unknown;
            name: string;
            phoneNumber: string;
            profilePic: string;
            snooze: boolean;
        };
    }>;
}
