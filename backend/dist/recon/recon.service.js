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
exports.ReconService = void 0;
const common_1 = require("@nestjs/common");
let ReconService = class ReconService {
    constructor(userProfileModel, reconRequestModel, connectionModel, notificationsService) {
        this.userProfileModel = userProfileModel;
        this.reconRequestModel = reconRequestModel;
        this.connectionModel = connectionModel;
        this.notificationsService = notificationsService;
    }
    async recon(userId, reconDto) {
        var _a;
        const { location, distance } = reconDto;
        const connections = await this.connectionModel.find({
            $or: [{ user1Id: userId }, { user2Id: userId }],
        });
        const connectionIds = connections.map((c) => (c.user1Id.toString() === userId.toString() ? c.user2Id : c.user1Id));
        const typeMap = new Map();
        for (const c of connections) {
            const other = c.user1Id.toString() === userId.toString() ? c.user2Id.toString() : c.user1Id.toString();
            typeMap.set(other, c.connectionType || 0);
        }
        const nearbyUsers = await this.userProfileModel.find({
            _id: { $in: connectionIds },
            snooze: { $ne: true },
            lastLocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: location },
                    $maxDistance: distance * 1000,
                },
            },
        });
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
        for (const u of nearbyUsers) {
            const exists = await this.reconRequestModel.findOne({
                fromId: userId,
                toId: u._id,
                status: "pending",
                expiresAt: { $gt: now },
            });
            if (!exists) {
                const request = await this.reconRequestModel.create({
                    fromId: userId,
                    toId: u._id,
                    status: "pending",
                    createdAt: now,
                    expiresAt,
                });
                if ((_a = u.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) {
                    for (const t of u.deviceTokens) {
                        await this.notificationsService.sendPushNotification(t.token, "Someone is nearby!", "You have a nearby ping request. Open Beacon to respond.", { requestId: request._id }, t.tokenType || "generic");
                    }
                }
            }
        }
        const formattedUsers = nearbyUsers.map((user) => {
            const dist = this.calculateDistance(location[1], location[0], user.lastLocation.coordinates[1], user.lastLocation.coordinates[0]);
            const ctype = typeMap.get(user._id.toString()) || 0;
            const canSeeProfile = ctype >= 2;
            return {
                id: user._id,
                distance: dist,
                canSeeProfile,
                name: canSeeProfile ? user.name : undefined,
                profilePic: canSeeProfile ? user.profilePic : undefined,
            };
        });
        return { nearbyUsers: formattedUsers };
    }
    async ping(fromId, toId) {
        var _a;
        const existingRequest = await this.reconRequestModel.findOne({
            fromId,
            toId,
            status: "pending",
        });
        if (existingRequest)
            throw new Error("A ping request is already pending");
        const reconRequest = new this.reconRequestModel({
            fromId,
            toId,
            status: "pending",
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });
        await reconRequest.save();
        const fromUser = await this.userProfileModel.findById(fromId);
        const toUser = await this.userProfileModel.findById(toId);
        if (!fromUser || !toUser)
            throw new Error("User not found");
        const distance = this.calculateDistance(fromUser.lastLocation.coordinates[1], fromUser.lastLocation.coordinates[0], toUser.lastLocation.coordinates[1], toUser.lastLocation.coordinates[0]);
        if ((_a = toUser.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) {
            for (const t of toUser.deviceTokens) {
                await this.notificationsService.sendPushNotification(t.token, "Someone is nearby!", `${fromUser.name} is in the same city, ~${distance.toFixed(1)}km away.`, { requestId: reconRequest._id }, t.tokenType || "generic");
            }
        }
        return { message: "Ping sent successfully", requestId: reconRequest._id };
    }
    async acceptPing(userId, requestId) {
        var _a;
        const request = await this.reconRequestModel.findById(requestId);
        if (!request)
            throw new Error("Request not found");
        if (request.toId.toString() !== userId.toString())
            throw new Error("Unauthorized");
        if (request.status !== "pending")
            throw new Error("Request is not pending");
        request.status = "accepted";
        await request.save();
        const fromUser = await this.userProfileModel.findById(request.fromId);
        const toUser = await this.userProfileModel.findById(request.toId);
        if (!fromUser || !toUser)
            throw new Error("User not found");
        const distance = this.calculateDistance(fromUser.lastLocation.coordinates[1], fromUser.lastLocation.coordinates[0], toUser.lastLocation.coordinates[1], toUser.lastLocation.coordinates[0]);
        if ((_a = fromUser.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) {
            for (const t of fromUser.deviceTokens) {
                await this.notificationsService.sendPushNotification(t.token, "Ping accepted!", `${toUser.name} is nearby (~${distance.toFixed(1)}km).`, { requestId: request._id }, t.tokenType || "generic");
            }
        }
        return { message: "Ping accepted successfully" };
    }
    async rejectPing(userId, requestId) {
        var _a;
        const request = await this.reconRequestModel.findById(requestId);
        if (!request)
            throw new Error("Request not found");
        if (request.toId.toString() !== userId.toString())
            throw new Error("Unauthorized");
        if (request.status !== "pending")
            throw new Error("Request is not pending");
        const fromUser = await this.userProfileModel.findById(request.fromId);
        const toUser = await this.userProfileModel.findById(request.toId);
        await this.reconRequestModel.findByIdAndDelete(requestId);
        if (((_a = fromUser === null || fromUser === void 0 ? void 0 : fromUser.deviceTokens) === null || _a === void 0 ? void 0 : _a.length) && toUser) {
            for (const t of fromUser.deviceTokens) {
                await this.notificationsService.sendPushNotification(t.token, "Ping declined", `${toUser.name} declined your ping.`, { requestId }, t.tokenType || "generic");
            }
        }
        return { message: "Ping rejected successfully" };
    }
    async getPingRequests(userId) {
        const requests = await this.reconRequestModel.find({ toId: userId, status: "pending" }).sort({ createdAt: -1 });
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
        return { requests: requestsWithSenderInfo };
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.ReconService = ReconService;
exports.ReconService = ReconService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function])
], ReconService);
//# sourceMappingURL=recon.service.js.map