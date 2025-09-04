"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    constructor(userAuthModel, userProfileModel, jwtService, notificationsService, otpRateLimit, configService) {
        this.userAuthModel = userAuthModel;
        this.userProfileModel = userProfileModel;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
        this.otpRateLimit = otpRateLimit;
        this.configService = configService;
    }
    async signup(signupDto) {
        const existingUser = await this.userAuthModel.findOne({ phoneNumber: signupDto.phoneNumber });
        if (existingUser) {
            throw new Error("User already exists");
        }
        await this.otpRateLimit.assertCanSend(signupDto.phoneNumber);
        const otp = this.generateOtp();
        const userAuth = new this.userAuthModel({
            phoneNumber: signupDto.phoneNumber,
            name: signupDto.name,
            otp,
        });
        await userAuth.save();
        await this.notificationsService.sendOtp(signupDto.phoneNumber, otp, "signup");
        await this.otpRateLimit.logSend(signupDto.phoneNumber);
        return { message: "OTP sent successfully", userId: userAuth._id };
    }
    async verifyOtpSignup(verifyOtpDto) {
        const userAuth = await this.userAuthModel.findById(verifyOtpDto.userId);
        if (!userAuth)
            throw new Error("User not found");
        if (userAuth.otp !== verifyOtpDto.otp)
            throw new Error("Invalid OTP");
        userAuth.otp = undefined;
        await userAuth.save();
        const userProfile = new this.userProfileModel({
            name: userAuth.name,
            phoneNumber: userAuth.phoneNumber,
            userAuthId: userAuth._id,
        });
        await userProfile.save();
        userAuth.userProfileId = userProfile._id;
        const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id });
        userAuth.authToken = token;
        await userAuth.save();
        return {
            token,
            user: {
                id: userProfile._id,
                name: userProfile.name,
                phoneNumber: userProfile.phoneNumber,
                profilePic: userProfile.profilePic,
                snooze: userProfile.snooze,
            },
        };
    }
    async login(loginDto) {
        const userAuth = await this.userAuthModel.findOne({ phoneNumber: loginDto.phoneNumber });
        await this.otpRateLimit.assertCanSend(loginDto.phoneNumber);
        if (!userAuth) {
            const otp = this.generateOtp();
            const newAuth = new this.userAuthModel({ phoneNumber: loginDto.phoneNumber, name: "", otp });
            await newAuth.save();
            await this.notificationsService.sendOtp(loginDto.phoneNumber, otp, "login");
            await this.otpRateLimit.logSend(loginDto.phoneNumber);
            return { message: "OTP sent successfully", userId: newAuth._id };
        }
        const otp = this.generateOtp();
        userAuth.otp = otp;
        await userAuth.save();
        await this.notificationsService.sendOtp(loginDto.phoneNumber, otp, "login");
        await this.otpRateLimit.logSend(loginDto.phoneNumber);
        return { message: "OTP sent successfully", userId: userAuth._id };
    }
    async verifyOtpLogin(verifyOtpDto) {
        const userAuth = await this.userAuthModel.findById(verifyOtpDto.userId);
        if (!userAuth)
            throw new Error("User not found");
        if (userAuth.otp !== verifyOtpDto.otp)
            throw new Error("Invalid OTP");
        userAuth.otp = "";
        const userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id });
        if (!userProfile)
            throw new Error("User profile not found");
        const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id });
        userAuth.authToken = token;
        await userAuth.save();
        return {
            token,
            user: {
                id: userProfile._id,
                name: userProfile.name,
                phoneNumber: userProfile.phoneNumber,
                profilePic: userProfile.profilePic,
                snooze: userProfile.snooze,
            },
        };
    }
    async resendOtp(phoneNumber, type) {
        const userAuth = await this.userAuthModel.findOne({ phoneNumber });
        if (!userAuth)
            throw new Error("User not found");
        await this.otpRateLimit.assertCanSend(phoneNumber);
        const otp = this.generateOtp();
        userAuth.otp = otp;
        await userAuth.save();
        await this.notificationsService.sendOtp(phoneNumber, otp, type);
        await this.otpRateLimit.logSend(phoneNumber);
        return { message: "OTP resent successfully", userId: userAuth._id };
    }
    generateOtp() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    async validateUser(userId) {
        const userAuth = await this.userAuthModel.findById(userId);
        if (!userAuth)
            return null;
        const userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id });
        if (!userProfile)
            return null;
        return {
            id: userProfile._id,
            name: userProfile.name,
            phoneNumber: userProfile.phoneNumber,
        };
    }
    async verifyMsg91Token(msg91Token, name) {
        var _a;
        const apiKey = this.configService.get("msg91.apiKey");
        if (!apiKey)
            throw new Error("MSG91 API key not configured");
        const res = await fetch("https://control.msg91.com/api/v5/otp/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                authkey: apiKey,
            },
            body: JSON.stringify({ token: msg91Token }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to verify OTP token: ${text}`);
        }
        const data = await res.json();
        const rawMobile = (data === null || data === void 0 ? void 0 : data.mobile) || (data === null || data === void 0 ? void 0 : data.phone) || ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.mobile);
        if (!rawMobile)
            throw new Error("Phone number not found in MSG91 verification response");
        const e164 = rawMobile.startsWith("+") ? rawMobile : `+${rawMobile}`;
        let userAuth = await this.userAuthModel.findOne({ phoneNumber: e164 });
        if (!userAuth) {
            userAuth = new this.userAuthModel({ phoneNumber: e164, name: name || "" });
            await userAuth.save();
        }
        let userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id });
        if (!userProfile) {
            userProfile = new this.userProfileModel({
                name: userAuth.name || name || "User",
                phoneNumber: e164,
                userAuthId: userAuth._id,
            });
            await userProfile.save();
            userAuth.userProfileId = userProfile._id;
            await userAuth.save();
        }
        else if (name && !userProfile.name) {
            userProfile.name = name;
            await userProfile.save();
        }
        const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id });
        userAuth.authToken = token;
        await userAuth.save();
        return {
            token,
            user: {
                id: userProfile._id,
                name: userProfile.name,
                phoneNumber: userProfile.phoneNumber,
                profilePic: userProfile.profilePic,
                snooze: userProfile.snooze,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function])
], AuthService);
//# sourceMappingURL=auth.service.js.map