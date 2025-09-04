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
exports.OtpRateLimitService = void 0;
const common_1 = require("@nestjs/common");
let OtpRateLimitService = class OtpRateLimitService {
    constructor(otpLogModel) {
        this.MAX_PER_WINDOW = 5;
        this.COOLDOWN_MS = 60 * 1000;
        this.otpLogModel = otpLogModel;
    }
    async assertCanSend(phoneNumber) {
        const since = new Date(Date.now() - 15 * 60 * 1000);
        const logs = await this.otpLogModel
            .find({ phoneNumber, createdAt: { $gte: since } })
            .sort({ createdAt: -1 })
            .limit(10);
        if (logs.length >= this.MAX_PER_WINDOW) {
            throw new Error("Too many OTP requests. Please try again later.");
        }
        if (logs[0] && Date.now() - logs[0].createdAt.getTime() < this.COOLDOWN_MS) {
            throw new Error("Please wait a minute before requesting another OTP.");
        }
    }
    async logSend(phoneNumber) {
        await this.otpLogModel.create({ phoneNumber });
    }
};
exports.OtpRateLimitService = OtpRateLimitService;
exports.OtpRateLimitService = OtpRateLimitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], OtpRateLimitService);
//# sourceMappingURL=otp-rate-limit.service.js.map