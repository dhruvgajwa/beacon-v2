"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const profile_controller_1 = require("./profile.controller");
const profile_service_1 = require("./profile.service");
const user_profile_schema_1 = require("./schemas/user-profile.schema");
const user_auth_schema_1 = require("../auth/schemas/user-auth.schema");
const connection_schema_1 = require("../connections/schemas/connection.schema");
const connection_request_schema_1 = require("../connections/schemas/connection-request.schema");
const recon_request_schema_1 = require("../recon/schemas/recon-request.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const audit_log_schema_1 = require("../audit/schemas/audit-log.schema");
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_profile_schema_1.UserProfile.name, schema: user_profile_schema_1.UserProfileSchema },
                { name: user_auth_schema_1.UserAuth.name, schema: user_auth_schema_1.UserAuthSchema },
                { name: connection_schema_1.Connection.name, schema: connection_schema_1.ConnectionSchema },
                { name: connection_request_schema_1.ConnectionRequest.name, schema: connection_request_schema_1.ConnectionRequestSchema },
                { name: recon_request_schema_1.ReconRequest.name, schema: recon_request_schema_1.ReconRequestSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [profile_controller_1.ProfileController],
        providers: [profile_service_1.ProfileService],
    })
], ProfileModule);
//# sourceMappingURL=profile.module.js.map