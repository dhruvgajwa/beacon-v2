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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
let AnalyticsService = class AnalyticsService {
    constructor(config) {
        this.config = config;
        this.enabled = this.config.get("analytics.enabled") !== false;
        this.gtmUrl = this.config.get("analytics.gtmServerUrl");
        this.ga4Mid = this.config.get("analytics.ga4MeasurementId");
        this.ga4Secret = this.config.get("analytics.ga4ApiSecret");
    }
    redact(params = {}) {
        const SENSITIVE = ["phone", "phoneNumber", "otp", "token", "password", "auth", "authorization"];
        const out = {};
        for (const [k, v] of Object.entries(params)) {
            if (SENSITIVE.includes(k))
                out[k] = "[REDACTED]";
            else
                out[k] = typeof v === "object" && v !== null ? this.redact(v) : v;
        }
        return out;
    }
    async track({ clientId, userId, event, params }) {
        if (!this.enabled)
            return { ok: false, reason: "disabled" };
        const redacted = this.redact(params || {});
        if (this.gtmUrl) {
            const url = `${this.gtmUrl.replace(/\/$/, "")}/g/collect?measurement_id=${encodeURIComponent(this.ga4Mid || "")}&api_secret=${encodeURIComponent(this.ga4Secret || "")}`;
            const body = {
                client_id: clientId,
                user_id: userId,
                events: [{ name: event, params: redacted }],
            };
            await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            return { ok: true, via: "gtm" };
        }
        if (this.ga4Mid && this.ga4Secret) {
            const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(this.ga4Mid)}&api_secret=${encodeURIComponent(this.ga4Secret)}`;
            const body = {
                client_id: clientId,
                user_id: userId,
                events: [{ name: event, params: redacted }],
            };
            await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            return { ok: true, via: "ga4" };
        }
        return { ok: false, reason: "no-destination" };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map