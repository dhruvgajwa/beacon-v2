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
var NewRelicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewRelicService = void 0;
const common_1 = require("@nestjs/common");
let NewRelicService = NewRelicService_1 = class NewRelicService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(NewRelicService_1.name);
        this.enabled = !!this.config.get("newRelic.enabled");
        this.licenseKey = this.config.get("newRelic.licenseKey");
        this.endpoint = this.config.get("newRelic.logEndpoint") || "https://log-api.newrelic.com/log/v1";
        this.appName = this.config.get("newRelic.appName") || "beacon-backend";
    }
    redact(obj) {
        const SENSITIVE = ["authorization", "auth", "token", "otp", "password", "pin", "secret", "apiKey", "cookie"];
        const redactValue = (v) => (typeof v === "string" ? "[REDACTED]" : v);
        const walk = (input) => {
            if (Array.isArray(input))
                return input.map(walk);
            if (input && typeof input === "object") {
                const out = {};
                for (const [k, v] of Object.entries(input)) {
                    if (SENSITIVE.includes(k.toLowerCase())) {
                        out[k] = redactValue(v);
                    }
                    else {
                        out[k] = walk(v);
                    }
                }
                return out;
            }
            return input;
        };
        return walk(obj);
    }
    async log(level, message, attributes) {
        if (!this.enabled || !this.licenseKey) {
            return;
        }
        const body = [
            {
                common: {
                    attributes: {
                        "service.name": this.appName,
                        level,
                    },
                },
                logs: [
                    {
                        message,
                        attributes: this.redact(attributes || {}),
                    },
                ],
            },
        ];
        try {
            await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": this.licenseKey,
                },
                body: JSON.stringify(body),
            });
        }
        catch (e) {
            this.logger.error("NewRelic log send failed", e);
        }
    }
    async logRequest(attributes) {
        return this.log("INFO", "http_request", attributes);
    }
    async logError(message, attributes) {
        return this.log("ERROR", message, attributes);
    }
};
exports.NewRelicService = NewRelicService;
exports.NewRelicService = NewRelicService = NewRelicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], NewRelicService);
//# sourceMappingURL=newrelic.service.js.map