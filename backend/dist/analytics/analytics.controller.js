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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
let AnalyticsController = class AnalyticsController {
    constructor(analytics) {
        this.analytics = analytics;
    }
    async track(body) {
        if (!(body === null || body === void 0 ? void 0 : body.clientId) || !(body === null || body === void 0 ? void 0 : body.event)) {
            return { ok: false, error: "clientId and event are required" };
        }
        return this.analytics.track(body);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)("track"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "track", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)("analytics"),
    __metadata("design:paramtypes", [Function])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map