import type { AuthService } from "./auth.service";
import type { SignupDto } from "./dto/signup.dto";
import type { LoginDto } from "./dto/login.dto";
import type { VerifyOtpDto } from "./dto/verify-otp.dto";
import type { ResendOtpDto } from "./dto/resend-otp.dto";
import type { VerifyMsg91Dto } from "./dto/verify-msg91.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    resendOtpSignup(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
        userId: unknown;
    }>;
    resendOtpLogin(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
        userId: unknown;
    }>;
    verifyMsg91(dto: VerifyMsg91Dto): Promise<{
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
