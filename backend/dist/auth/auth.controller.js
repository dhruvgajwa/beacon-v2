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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async signup(signupDto) {
        try {
            return await this.authService.signup(signupDto);
        }
        catch (error) {
            if (error.message === "User already exists") {
                throw new common_1.HttpException("User already exists", common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException("Failed to signup", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOtpSignup(verifyOtpDto) {
        try {
            return await this.authService.verifyOtpSignup(verifyOtpDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async login(loginDto) {
        try {
            return await this.authService.login(loginDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyOtpLogin(verifyOtpDto) {
        try {
            return await this.authService.verifyOtpLogin(verifyOtpDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async resendOtpSignup(resendOtpDto) {
        try {
            return await this.authService.resendOtp(resendOtpDto.phoneNumber, "signup");
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async resendOtpLogin(resendOtpDto) {
        try {
            return await this.authService.resendOtp(resendOtpDto.phoneNumber, "login");
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verifyMsg91(dto) {
        try {
            return await this.authService.verifyMsg91Token(dto.token, dto.name);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("signup"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("verify-otp-signup"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtpSignup", null);
__decorate([
    (0, common_1.Post)("login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("verify-otp-login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtpLogin", null);
__decorate([
    (0, common_1.Post)("resend-otp-signup"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtpSignup", null);
__decorate([
    (0, common_1.Post)("resend-otp-login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtpLogin", null);
__decorate([
    (0, common_1.Post)("msg91/verify"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMsg91", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [Function])
], AuthController);
//# sourceMappingURL=auth.controller.js.map