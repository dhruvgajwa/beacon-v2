"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_auth_schema_1 = require("./schemas/user-auth.schema");
const user_profile_schema_1 = require("../profile/schemas/user-profile.schema");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const notifications_module_1 = require("../notifications/notifications.module");
const otp_log_schema_1 = require("./schemas/otp-log.schema");
const otp_rate_limit_service_1 = require("./otp-rate-limit.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_auth_schema_1.UserAuth.name, schema: user_auth_schema_1.UserAuthSchema },
                { name: user_profile_schema_1.UserProfile.name, schema: user_profile_schema_1.UserProfileSchema },
                { name: otp_log_schema_1.OtpLog.name, schema: otp_log_schema_1.OtpLogSchema },
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get("jwt.secret"),
                    signOptions: { expiresIn: configService.get("jwt.expiresIn") },
                }),
                inject: [config_1.ConfigService],
            }),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, otp_rate_limit_service_1.OtpRateLimitService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map