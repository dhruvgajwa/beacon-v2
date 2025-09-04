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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        AWS.config.update({
            accessKeyId: this.config.get("aws.accessKeyId"),
            secretAccessKey: this.config.get("aws.secretAccessKey"),
            region: this.config.get("aws.region"),
        });
        this.snsRegion = this.config.get("aws.sns.region") || "us-east-1";
        this.sns = new AWS.SNS({
            apiVersion: this.config.get("aws.sns.apiVersion") || "2010-03-31",
            region: this.snsRegion,
        });
        this.expoPushEnabled = !!this.config.get("expoPush.enabled");
    }
    async sendPushNotification(token, title, body, data, tokenType = "generic") {
        try {
            if (tokenType === "sns") {
                return await this.sendSnsPush(token, title, body, data);
            }
            this.logger.warn(`Unsupported tokenType for server push: ${tokenType}. Consider registering SNS endpoint.`);
            return { ok: false };
        }
        catch (err) {
            this.logger.error("sendPushNotification failed", err);
            return { ok: false };
        }
    }
    async sendSnsPush(endpointArn, title, body, data) {
        const apnsPayload = {
            aps: {
                alert: { title, body },
                sound: "default",
                "content-available": 1,
            },
            data: Object.assign({}, (data || {})),
        };
        const fcmPayload = {
            notification: { title, body },
            data: Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v)])),
        };
        const message = {
            default: body,
            APNS: JSON.stringify({ aps: apnsPayload.aps, data: apnsPayload.data }),
            APNS_SANDBOX: JSON.stringify({ aps: apnsPayload.aps, data: apnsPayload.data }),
            GCM: JSON.stringify(fcmPayload),
        };
        const params = {
            Message: JSON.stringify(message),
            MessageStructure: "json",
            TargetArn: endpointArn,
        };
        const res = await this.sns.publish(params).promise();
        return { ok: true, messageId: res.MessageId };
    }
    async sendSms(phoneNumber, message) {
        try {
            const res = await this.sns
                .publish({
                Message: message,
                PhoneNumber: phoneNumber,
            })
                .promise();
            return { ok: true, messageId: res.MessageId };
        }
        catch (err) {
            this.logger.error("sendSms failed", err);
            return { ok: false };
        }
    }
    async sendOtp(phoneNumber, otp, purpose) {
        const message = `Your Beacon OTP is ${otp}. Purpose: ${purpose}. This code will expire in 10 minutes.`;
        return this.sendSms(phoneNumber, message);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map