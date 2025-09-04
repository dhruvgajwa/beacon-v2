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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
let ProfileService = class ProfileService {
    constructor(userProfileModel, userAuthModel, connectionModel, connectionRequestModel, reconRequestModel, auditLogModel, configService, notificationsService, otpRateLimit) {
        this.userProfileModel = userProfileModel;
        this.userAuthModel = userAuthModel;
        this.connectionModel = connectionModel;
        this.connectionRequestModel = connectionRequestModel;
        this.reconRequestModel = reconRequestModel;
        this.auditLogModel = auditLogModel;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.otpRateLimit = otpRateLimit;
        AWS.config.update({
            accessKeyId: this.configService.get("aws.accessKeyId"),
            secretAccessKey: this.configService.get("aws.secretAccessKey"),
            region: this.configService.get("aws.region"),
        });
        this.s3 = new AWS.S3();
        this.sns = new AWS.SNS({
            apiVersion: this.configService.get("aws.sns.apiVersion") || "2010-03-31",
            region: this.configService.get("aws.sns.region") || this.configService.get("aws.region") || "us-east-1",
        });
    }
    async getProfile(profileId) {
        const profile = await this.userProfileModel.findById(profileId);
        if (!profile)
            throw new Error("Profile not found");
        return {
            id: profile._id,
            name: profile.name,
            phoneNumber: profile.phoneNumber,
            profilePic: profile.profilePic,
            bio: profile.bio,
            interests: profile.interests,
            snooze: profile.snooze,
        };
    }
    async updateProfile(profileId, updateProfileDto) {
        const profile = await this.userProfileModel.findByIdAndUpdate(profileId, Object.assign({}, updateProfileDto), { new: true });
        if (!profile)
            throw new Error("Profile not found");
        return {
            id: profile._id,
            name: profile.name,
            phoneNumber: profile.phoneNumber,
            profilePic: profile.profilePic,
            bio: profile.bio,
            interests: profile.interests,
            snooze: profile.snooze,
        };
    }
    async updateProfilePhoto(profileId, file) {
        if (!file)
            throw new Error("No file uploaded");
        const uploadResult = await this.uploadFileToS3(file);
        const profile = await this.userProfileModel.findByIdAndUpdate(profileId, { profilePic: uploadResult.Location }, { new: true });
        if (!profile)
            throw new Error("Profile not found");
        return { profilePic: profile.profilePic };
    }
    async toggleSnooze(profileId, snooze) {
        const profile = await this.userProfileModel.findByIdAndUpdate(profileId, { snooze }, { new: true });
        if (!profile)
            throw new Error("Profile not found");
        return { snooze: profile.snooze };
    }
    async updateLocation(profileId, location, accuracy) {
        var _a;
        const profile = await this.userProfileModel.findById(profileId);
        if (!profile)
            throw new Error("Profile not found");
        const prev = ((_a = profile.lastLocation) === null || _a === void 0 ? void 0 : _a.coordinates) || [0, 0];
        const movedKm = this.calculateDistance(prev[1], prev[0], location[1], location[0]);
        if (movedKm < 0.05 && !accuracy) {
            return { skipped: true };
        }
        profile.lastLocation = { type: "Point", coordinates: location };
        profile.updatedAt = new Date();
        await profile.save();
        return { ok: true };
    }
    async registerDeviceToken(profileId, token, platform, tokenType) {
        const profile = await this.userProfileModel.findById(profileId);
        if (!profile)
            throw new Error("Profile not found");
        if (tokenType === "sns") {
            const endpointArn = await this.ensureSnsEndpoint(platform, token);
            const exists = profile.deviceTokens.some((t) => t.token === endpointArn && t.tokenType === "sns");
            if (!exists) {
                profile.deviceTokens.push({ token: endpointArn, platform, tokenType: "sns", createdAt: new Date() });
                await profile.save();
            }
            return { ok: true, tokenType: "sns" };
        }
        else {
            const exists = profile.deviceTokens.some((t) => t.token === token);
            if (!exists) {
                profile.deviceTokens.push({ token, platform, tokenType: tokenType || "generic", createdAt: new Date() });
                await profile.save();
            }
            return { ok: true };
        }
    }
    async deleteProfile(profileId, authId) {
        await this.connectionModel.deleteMany({ $or: [{ user1Id: profileId }, { user2Id: profileId }] });
        await this.connectionRequestModel.deleteMany({ $or: [{ fromId: profileId }, { toId: profileId }] });
        await this.reconRequestModel.deleteMany({ $or: [{ fromId: profileId }, { toId: profileId }] });
        await this.userProfileModel.findByIdAndDelete(profileId);
        await this.userAuthModel.findByIdAndDelete(authId);
        return { message: "Profile deleted successfully" };
    }
    async clearData(profileId) {
        await this.connectionModel.deleteMany({ $or: [{ user1Id: profileId }, { user2Id: profileId }] });
        await this.connectionRequestModel.deleteMany({ $or: [{ fromId: profileId }, { toId: profileId }] });
        await this.reconRequestModel.deleteMany({ $or: [{ fromId: profileId }, { toId: profileId }] });
        return { message: "Data cleared successfully" };
    }
    async exportData(profileId, authId) {
        const profile = await this.userProfileModel.findById(profileId).lean();
        const connections = await this.connectionModel
            .find({ $or: [{ user1Id: profileId }, { user2Id: profileId }] })
            .lean();
        const requests = await this.connectionRequestModel
            .find({ $or: [{ fromId: profileId }, { toId: profileId }] })
            .lean();
        const pings = await this.reconRequestModel.find({ $or: [{ fromId: profileId }, { toId: profileId }] }).lean();
        const audits = await this.auditLogModel.find({ userAuthId: authId }).lean();
        return { profile, connections, requests, pings, audits };
    }
    async requestPhoneNumberUpdate(authId, newPhoneNumber) {
        const auth = await this.userAuthModel.findById(authId);
        if (!auth)
            throw new Error("User not found");
        if (auth.phoneNumber === newPhoneNumber)
            throw new Error("New phone number is the same as the current number");
        const existing = await this.userAuthModel.findOne({ phoneNumber: newPhoneNumber, _id: { $ne: auth._id } });
        if (existing)
            throw new Error("An account with this phone number already exists");
        await this.otpRateLimit.assertCanSend(newPhoneNumber);
        const otp = this.generateOtp();
        auth.phoneUpdateNewNumber = newPhoneNumber;
        auth.phoneUpdateOtp = otp;
        auth.phoneUpdateOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await auth.save();
        await this.auditLogModel.create({
            userAuthId: auth._id,
            action: "request_phone_update",
            metadata: { newPhoneNumber },
        });
        await this.notificationsService.sendOtp(newPhoneNumber, otp, "update_number");
        await this.otpRateLimit.logSend(newPhoneNumber);
        return { message: "OTP sent to new phone number" };
    }
    async verifyPhoneNumberUpdate(authId, otp) {
        const auth = await this.userAuthModel.findById(authId);
        if (!auth)
            throw new Error("User not found");
        if (!auth.phoneUpdateOtp || !auth.phoneUpdateNewNumber || !auth.phoneUpdateOtpExpiresAt)
            throw new Error("No phone update request found");
        if (new Date() > auth.phoneUpdateOtpExpiresAt)
            throw new Error("OTP has expired");
        if (auth.phoneUpdateOtp !== otp)
            throw new Error("Invalid OTP");
        const existing = await this.userAuthModel.findOne({
            phoneNumber: auth.phoneUpdateNewNumber,
            _id: { $ne: auth._id },
        });
        if (existing)
            throw new Error("An account with this phone number already exists");
        const newPhone = auth.phoneUpdateNewNumber;
        auth.phoneNumber = newPhone;
        auth.phoneUpdateNewNumber = undefined;
        auth.phoneUpdateOtp = undefined;
        auth.phoneUpdateOtpExpiresAt = undefined;
        await auth.save();
        if (auth.userProfileId) {
            await this.userProfileModel.findByIdAndUpdate(auth.userProfileId, { phoneNumber: newPhone });
        }
        await this.auditLogModel.create({
            userAuthId: auth._id,
            action: "verify_phone_update",
            metadata: { newPhoneNumber: newPhone },
        });
        return { message: "Phone number updated successfully", phoneNumber: newPhone };
    }
    async requestDeleteProfileOtp(authId) {
        const auth = await this.userAuthModel.findById(authId);
        if (!auth)
            throw new Error("User not found");
        await this.otpRateLimit.assertCanSend(auth.phoneNumber);
        const otp = this.generateOtp();
        auth.deleteOtp = otp;
        auth.deleteOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await auth.save();
        await this.auditLogModel.create({
            userAuthId: auth._id,
            action: "request_delete_account",
        });
        await this.notificationsService.sendOtp(auth.phoneNumber, otp, "delete_account");
        await this.otpRateLimit.logSend(auth.phoneNumber);
        return { message: "OTP sent to your phone number" };
    }
    async verifyAndDeleteProfile(profileId, authId, otp) {
        const auth = await this.userAuthModel.findById(authId);
        if (!auth)
            throw new Error("User not found");
        if (!auth.deleteOtp || !auth.deleteOtpExpiresAt)
            throw new Error("No delete request found");
        if (new Date() > auth.deleteOtpExpiresAt)
            throw new Error("OTP has expired");
        if (auth.deleteOtp !== otp)
            throw new Error("Invalid OTP");
        auth.deleteOtp = undefined;
        auth.deleteOtpExpiresAt = undefined;
        await auth.save();
        await this.auditLogModel.create({
            userAuthId: auth._id,
            action: "verify_delete_account",
        });
        return this.deleteProfile(profileId, authId);
    }
    generateOtp() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    async uploadFileToS3(file) {
        const params = {
            Bucket: this.configService.get("aws.s3.bucket"),
            Key: `profile-photos/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        };
        return this.s3.upload(params).promise();
    }
    getPlatformApplicationArn(platform) {
        const ios = this.configService.get("aws.sns.platformApplicationArn.ios");
        const android = this.configService.get("aws.sns.platformApplicationArn.android");
        return platform === "ios" ? ios : android;
    }
    async ensureSnsEndpoint(platform, deviceToken) {
        const appArn = this.getPlatformApplicationArn(platform);
        if (!appArn)
            throw new Error("SNS PlatformApplicationArn is not configured");
        const res = await this.sns
            .createPlatformEndpoint({
            PlatformApplicationArn: appArn,
            Token: deviceToken,
            Attributes: { Enabled: "true" },
        })
            .promise();
        return res.EndpointArn;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function, Function, Function, Function])
], ProfileService);
//# sourceMappingURL=profile.service.js.map