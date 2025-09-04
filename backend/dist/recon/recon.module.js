"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const recon_controller_1 = require("./recon.controller");
const recon_service_1 = require("./recon.service");
const user_profile_schema_1 = require("../profile/schemas/user-profile.schema");
const recon_request_schema_1 = require("./schemas/recon-request.schema");
const connection_schema_1 = require("../connections/schemas/connection.schema");
const notifications_module_1 = require("../notifications/notifications.module");
let ReconModule = class ReconModule {
};
exports.ReconModule = ReconModule;
exports.ReconModule = ReconModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_profile_schema_1.UserProfile.name, schema: user_profile_schema_1.UserProfileSchema },
                { name: recon_request_schema_1.ReconRequest.name, schema: recon_request_schema_1.ReconRequestSchema },
                { name: connection_schema_1.Connection.name, schema: connection_schema_1.ConnectionSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [recon_controller_1.ReconController],
        providers: [recon_service_1.ReconService],
    })
], ReconModule);
//# sourceMappingURL=recon.module.js.map