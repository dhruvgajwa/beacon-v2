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
exports.UserProfileSchema = exports.UserProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserProfile = class UserProfile {
};
exports.UserProfile = UserProfile;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserProfile.prototype, "profilePic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: "" }),
    __metadata("design:type", String)
], UserProfile.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], UserProfile.prototype, "interests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: "UserAuth", required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], UserProfile.prototype, "userAuthId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    }),
    __metadata("design:type", Object)
], UserProfile.prototype, "lastLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                token: { type: String, required: true },
                platform: { type: String, enum: ["ios", "android"], required: true },
                tokenType: { type: String, enum: ["expo", "generic", "sns"], default: "generic" },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], UserProfile.prototype, "deviceTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], UserProfile.prototype, "snooze", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], UserProfile.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], UserProfile.prototype, "updatedAt", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, mongoose_1.Schema)()
], UserProfile);
exports.UserProfileSchema = mongoose_1.SchemaFactory.createForClass(UserProfile);
exports.UserProfileSchema.index({ lastLocation: "2dsphere" });
//# sourceMappingURL=user-profile.schema.js.map