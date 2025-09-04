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
var MaintenanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
let MaintenanceService = MaintenanceService_1 = class MaintenanceService {
    constructor(userAuthModel) {
        this.logger = new common_1.Logger(MaintenanceService_1.name);
        this.userAuthModel = userAuthModel;
    }
    async clearExpiredOtps() {
        const now = new Date();
        const res = await this.userAuthModel.updateMany({
            $or: [{ phoneUpdateOtpExpiresAt: { $lt: now } }, { deleteOtpExpiresAt: { $lt: now } }],
        }, {
            $unset: {
                phoneUpdateOtp: "",
                phoneUpdateOtpExpiresAt: "",
                phoneUpdateNewNumber: "",
                deleteOtp: "",
                deleteOtpExpiresAt: "",
            },
        });
        this.logger.log(`Cleared stale OTP fields for ${res.modifiedCount} auth records`);
    }
};
exports.MaintenanceService = MaintenanceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MaintenanceService.prototype, "clearExpiredOtps", null);
exports.MaintenanceService = MaintenanceService = MaintenanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map