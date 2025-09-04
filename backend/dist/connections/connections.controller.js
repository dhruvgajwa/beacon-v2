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
exports.ConnectionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ConnectionsController = class ConnectionsController {
    constructor(connectionsService, config) {
        this.connectionsService = connectionsService;
        this.config = config;
    }
    async getConnections() {
        const req = this.getRequest();
        return this.connectionsService.getConnections(req.user.profileId);
    }
    async getConnectionRequests() {
        const req = this.getRequest();
        return this.connectionsService.getConnectionRequests(req.user.profileId);
    }
    async sendConnectionRequest(sendConnectionRequestDto) {
        const req = this.getRequest();
        return this.connectionsService.sendConnectionRequest(req.user.profileId, sendConnectionRequestDto);
    }
    async acceptConnectionRequest(requestId) {
        const req = this.getRequest();
        return this.connectionsService.acceptConnectionRequest(req.user.profileId, requestId);
    }
    async rejectConnectionRequest(requestId) {
        const req = this.getRequest();
        return this.connectionsService.rejectConnectionRequest(req.user.profileId, requestId);
    }
    async lookupContacts(body) {
        const req = this.getRequest();
        return this.connectionsService.lookupContacts(req.user.profileId, body.phoneNumbers);
    }
    async updateConnectionType(connectionId, body) {
        const req = this.getRequest();
        return this.connectionsService.updateConnectionType(req.user.profileId, connectionId, body.connectionType);
    }
    async createInviteLink() {
        const req = this.getRequest();
        return this.connectionsService.createInviteLink(req.user.profileId);
    }
    async acceptInvite(body) {
        const req = this.getRequest();
        return this.connectionsService.acceptInviteToken(req.user.profileId, body.token);
    }
    async invite(body) {
        var _a;
        const req = this.getRequest();
        const { phoneNumber, sendSms = true, sendWhatsApp = true } = body;
        const { token } = await this.connectionsService.createInviteLink(req.user.profileId);
        const base = this.config.get("invite.baseUrl") || "https://beacon.app/invite";
        const link = `${base}?token=${encodeURIComponent(token)}`;
        const inviterName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || "A friend";
        const message = `${inviterName} has requested you to try Beacon. Join here: ${link}`;
        if (sendSms) {
            await this.connectionsService.sendSmsInvite(phoneNumber, message);
        }
        if (sendWhatsApp) {
            await this.connectionsService.sendWhatsAppInvite(phoneNumber, message);
        }
        return { link, token, sentSms: !!sendSms, sentWhatsApp: !!sendWhatsApp };
    }
    async sendConnectionRequestAlias(body) {
        const req = this.getRequest();
        return this.connectionsService.sendConnectionRequest(req.user.profileId, body);
    }
    async acceptConnectionRequestAlias(requestId) {
        const req = this.getRequest();
        return this.connectionsService.acceptConnectionRequest(req.user.profileId, requestId);
    }
    async rejectConnectionRequestAlias(requestId) {
        const req = this.getRequest();
        return this.connectionsService.rejectConnectionRequest(req.user.profileId, requestId);
    }
    getRequest() {
        return { user: { profileId: "some-profile-id", name: "John Doe" } };
    }
};
exports.ConnectionsController = ConnectionsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "getConnections", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("requests"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "getConnectionRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("send-request"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "sendConnectionRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("accept-request/:requestId"),
    __param(0, (0, common_1.Param)("requestId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "acceptConnectionRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("reject-request/:requestId"),
    __param(0, (0, common_1.Param)("requestId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "rejectConnectionRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("lookup"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "lookupContacts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":connectionId/type"),
    __param(0, (0, common_1.Param)("connectionId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "updateConnectionType", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("invite-link"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "createInviteLink", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("accept-invite"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("invite"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "invite", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("send-connection-request"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "sendConnectionRequestAlias", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("accept-connection-request/:requestId"),
    __param(0, (0, common_1.Param)("requestId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "acceptConnectionRequestAlias", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("reject-connection-request/:requestId"),
    __param(0, (0, common_1.Param)("requestId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConnectionsController.prototype, "rejectConnectionRequestAlias", null);
exports.ConnectionsController = ConnectionsController = __decorate([
    (0, common_1.Controller)("connections"),
    __metadata("design:paramtypes", [Object, Function])
], ConnectionsController);
//# sourceMappingURL=connections.controller.js.map