"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const connections_controller_1 = require("./connections.controller");
const connections_service_1 = require("./connections.service");
const connection_schema_1 = require("./schemas/connection.schema");
const connection_request_schema_1 = require("./schemas/connection-request.schema");
const user_profile_schema_1 = require("../profile/schemas/user-profile.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const invite_token_schema_1 = require("./schemas/invite-token.schema");
let ConnectionsModule = class ConnectionsModule {
};
exports.ConnectionsModule = ConnectionsModule;
exports.ConnectionsModule = ConnectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: connection_schema_1.Connection.name, schema: connection_schema_1.ConnectionSchema },
                { name: connection_request_schema_1.ConnectionRequest.name, schema: connection_request_schema_1.ConnectionRequestSchema },
                { name: user_profile_schema_1.UserProfile.name, schema: user_profile_schema_1.UserProfileSchema },
                { name: invite_token_schema_1.InviteToken.name, schema: invite_token_schema_1.InviteTokenSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [connections_controller_1.ConnectionsController],
        providers: [connections_service_1.ConnectionsService],
        exports: [connections_service_1.ConnectionsService],
    })
], ConnectionsModule);
//# sourceMappingURL=connections.module.js.map