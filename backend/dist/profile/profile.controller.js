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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProfileController = class ProfileController {
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getProfile(req) {
        return this.profileService.getProfile(req.user.profileId);
    }
    async updateProfilePhoto(req, file) {
        return this.profileService.updateProfilePhoto(req.user.profileId, file);
    }
    async toggleSnooze(req, body) {
        return this.profileService.toggleSnooze(req.user.profileId, body.snooze);
    }
    async updateProfile(req, updateProfileDto) {
        return this.profileService.updateProfile(req.user.profileId, updateProfileDto);
    }
    async updateLocation(req, dto) {
        try {
            return await this.profileService.updateLocation(req.user.profileId, dto.location, dto.accuracy);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to update location", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async registerDeviceToken(req, dto) {
        try {
            return await this.profileService.registerDeviceToken(req.user.profileId, dto.token, dto.platform, dto.tokenType || "generic");
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to register device token", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async exportData(req) {
        return this.profileService.exportData(req.user.profileId, req.user.sub);
    }
    async clearData(req) {
        return this.profileService.clearData(req.user.profileId);
    }
    async requestDeleteProfileOtp(req) {
        try {
            return await this.profileService.requestDeleteProfileOtp(req.user.sub);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to request delete OTP", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyDeleteProfile(req, dto) {
        try {
            return await this.profileService.verifyAndDeleteProfile(req.user.profileId, req.user.sub, dto.otp);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to verify delete OTP", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async requestPhoneNumberUpdate(req, dto) {
        try {
            return await this.profileService.requestPhoneNumberUpdate(req.user.sub, dto.newPhoneNumber);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to request number update", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyPhoneNumberUpdate(req, dto) {
        try {
            return await this.profileService.verifyPhoneNumberUpdate(req.user.sub, dto.otp);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || "Failed to verify number update", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteProfile() {
        throw new common_1.HttpException("This endpoint is deprecated. Use /profile/request-OTP-delete-profile then /profile/verify-OTP-delete-profile", common_1.HttpStatus.BAD_REQUEST);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("update-profile-photo"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("profilePicture")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfilePhoto", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("snooze"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "toggleSnooze", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("update-location"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("register-device-token"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "registerDeviceToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("export"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "exportData", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("clear-data"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "clearData", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("request-OTP-delete-profile"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "requestDeleteProfileOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("verify-OTP-delete-profile"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "verifyDeleteProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("update-number"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "requestPhoneNumberUpdate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("verify-OTP-update-number"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "verifyPhoneNumberUpdate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)("delete-profile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "deleteProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)("profile"),
    __metadata("design:paramtypes", [Function])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map