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
exports.ConnectionsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let ConnectionsService = class ConnectionsService {
    constructor(connectionModel, connectionRequestModel, userProfileModel, inviteTokenModel, notificationsService) {
        this.connectionModel = connectionModel;
        this.connectionRequestModel = connectionRequestModel;
        this.userProfileModel = userProfileModel;
        this.inviteTokenModel = inviteTokenModel;
        this.notificationsService = notificationsService;
    }
    async getConnections(userId) {
        const connections = await this.connectionModel.find({
            $or: [{ user1Id: userId }, { user2Id: userId }],
        });
        const connectionsWithUserInfo = await Promise.all(connections.map(async (connection) => {
            const otherUserId = connection.user1Id.toString() === userId.toString()
                ? connection.user2Id
                : connection.user1Id;
            const otherUser = await this.userProfileModel.findById(otherUserId);
            return {
                id: connection._id,
                name: otherUser.name,
                phoneNumber: otherUser.phoneNumber,
                profilePic: otherUser.profilePic,
                connectionType: connection.connectionType,
            };
        }));
        return {
            connections: connectionsWithUserInfo,
        };
    }
    async getConnectionRequests(userId) {
        const requests = await this.connectionRequestModel
            .find({
            toId: userId,
        })
            .sort({ createdAt: -1 });
        const requestsWithSenderInfo = await Promise.all(requests.map(async (request) => {
            const sender = await this.userProfileModel.findById(request.fromId);
            return {
                id: request._id,
                from: {
                    id: sender._id,
                    name: sender.name,
                    phoneNumber: sender.phoneNumber,
                    profilePic: sender.profilePic,
                },
                createdAt: request.createdAt,
            };
        }));
        return {
            requests: requestsWithSenderInfo,
        };
    }
    async sendConnectionRequest(fromId, sendConnectionRequestDto) {
        var _a;
        const { phoneNumber } = sendConnectionRequestDto;
        const toUser = await this.userProfileModel.findOne({ phoneNumber });
        if (!toUser)
            throw new Error("User not found");
        const existingConnection = await this.connectionModel.findOne({
            $or: [
                { user1Id: fromId, user2Id: toUser._id },
                { user1Id: toUser._id, user2Id: fromId },
            ],
        });
        if (existingConnection)
            throw new Error("You are already connected with this user");
        const existingRequest = await this.connectionRequestModel.findOne({
            fromId,
            toId: toUser._id,
        });
        if (existingRequest)
            throw new Error("A connection request is already pending");
        const connectionRequest = new this.connectionRequestModel({
            fromId,
            toId: toUser._id,
            createdAt: new Date(),
        });
        await connectionRequest.save();
        const fromUser = await this.userProfileModel.findById(fromId);
        if ((_a = toUser.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) {
            for (const t of toUser.deviceTokens) {
                await this.notificationsService.sendPushNotification(t.token, "New Connection Request", `${fromUser.name} wants to connect with you.`, { requestId: connectionRequest._id }, t.tokenType || "generic");
            }
        }
        return { message: "Connection request sent successfully", requestId: connectionRequest._id };
    }
    async acceptConnectionRequest(userId, requestId) {
        var _a;
        const request = await this.connectionRequestModel.findById(requestId);
        if (!request)
            throw new Error("Request not found");
        if (request.toId.toString() !== userId.toString())
            throw new Error("Unauthorized");
        const connection = new this.connectionModel({
            user1Id: request.fromId,
            user2Id: request.toId,
            connectionType: 0,
            createdAt: new Date(),
        });
        await connection.save();
        await this.connectionRequestModel.findByIdAndDelete(requestId);
        const fromUser = await this.userProfileModel.findById(request.fromId);
        const toUser = await this.userProfileModel.findById(request.toId);
        if ((_a = fromUser.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) {
            for (const t of fromUser.deviceTokens) {
                await this.notificationsService.sendPushNotification(t.token, "Connection Request Accepted", `${toUser.name} accepted your connection request.`, { connectionId: connection._id }, t.tokenType || "generic");
            }
        }
        return { message: "Connection request accepted successfully", connectionId: connection._id };
    }
    async rejectConnectionRequest(userId, requestId) {
        const request = await this.connectionRequestModel.findById(requestId);
        if (!request)
            throw new Error("Request not found");
        if (request.toId.toString() !== userId.toString())
            throw new Error("Unauthorized");
        await this.connectionRequestModel.findByIdAndDelete(requestId);
        return { message: "Connection request rejected successfully" };
    }
    async updateConnectionType(userId, connectionId, connectionType) {
        const conn = await this.connectionModel.findById(connectionId);
        if (!conn)
            throw new Error("Connection not found");
        if (conn.user1Id.toString() !== userId.toString() &&
            conn.user2Id.toString() !== userId.toString()) {
            throw new Error("Unauthorized");
        }
        conn.connectionType = connectionType;
        await conn.save();
        return { message: "Connection type updated", connectionType };
    }
    async createInviteLink(inviterId) {
        const token = crypto_1.default.randomBytes(16).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.inviteTokenModel.create({ token, inviterId, expiresAt });
        return { token };
    }
    async acceptInviteToken(inviteeId, token) {
        const record = await this.inviteTokenModel.findOne({ token });
        if (!record)
            throw new Error("Invalid or expired invite");
        const existing = await this.connectionModel.findOne({
            $or: [
                { user1Id: record.inviterId, user2Id: inviteeId },
                { user2Id: record.inviterId, user1Id: inviteeId },
            ],
        });
        if (!existing) {
            const connection = new this.connectionModel({
                user1Id: record.inviterId,
                user2Id: inviteeId,
                connectionType: 0,
                createdAt: new Date(),
            });
            await connection.save();
        }
        await this.inviteTokenModel.deleteOne({ _id: record._id });
        return { message: "Connected successfully via invite" };
    }
    async lookupContacts(fromId, phoneNumbers) {
        const profiles = await this.userProfileModel.find({ phoneNumber: { $in: phoneNumbers } });
        const phoneToProfile = new Map();
        const profileIds = [];
        for (const p of profiles) {
            phoneToProfile.set(p.phoneNumber, p);
            profileIds.push(p._id.toString());
        }
        const connections = await this.connectionModel.find({
            $or: [
                { user1Id: fromId, user2Id: { $in: profileIds } },
                { user2Id: fromId, user1Id: { $in: profileIds } },
            ],
        });
        const connectedSet = new Set();
        for (const c of connections) {
            const otherId = c.user1Id.toString() === fromId.toString() ? c.user2Id.toString() : c.user1Id.toString();
            const profile = profiles.find((p) => p._id.toString() === otherId);
            if (profile)
                connectedSet.add(profile.phoneNumber);
        }
        const pendingOutgoing = await this.connectionRequestModel.find({
            fromId,
            toId: { $in: profileIds },
        });
        const pendingOutgoingSet = new Set();
        for (const r of pendingOutgoing) {
            const profile = profiles.find((p) => p._id.toString() === r.toId.toString());
            if (profile)
                pendingOutgoingSet.add(profile.phoneNumber);
        }
        const pendingIncoming = await this.connectionRequestModel.find({
            toId: fromId,
            fromId: { $in: profileIds },
        });
        const pendingIncomingSet = new Set();
        for (const r of pendingIncoming) {
            const profile = profiles.find((p) => p._id.toString() === r.fromId.toString());
            if (profile)
                pendingIncomingSet.add(profile.phoneNumber);
        }
        const results = phoneNumbers.map((phone) => {
            if (!phoneToProfile.has(phone)) {
                return { phoneNumber: phone, status: "not_registered" };
            }
            if (connectedSet.has(phone))
                return { phoneNumber: phone, status: "connected" };
            if (pendingOutgoingSet.has(phone))
                return { phoneNumber: phone, status: "pending_outgoing" };
            if (pendingIncomingSet.has(phone))
                return { phoneNumber: phone, status: "pending_incoming" };
            return { phoneNumber: phone, status: "available" };
        });
        return { results };
    }
    async sendSmsInvite(phoneNumber, message) {
        return this.notificationsService.sendSms(phoneNumber, message);
    }
    async sendWhatsAppInvite(phoneNumber, message) {
        return this.notificationsService.sendSms(phoneNumber, message);
    }
};
exports.ConnectionsService = ConnectionsService;
exports.ConnectionsService = ConnectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function])
], ConnectionsService);
//# sourceMappingURL=connections.service.js.map