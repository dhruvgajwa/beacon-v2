"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const maintenance_service_1 = require("./maintenance.service");
const user_auth_schema_1 = require("../auth/schemas/user-auth.schema");
let MaintenanceModule = class MaintenanceModule {
};
exports.MaintenanceModule = MaintenanceModule;
exports.MaintenanceModule = MaintenanceModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: user_auth_schema_1.UserAuth.name, schema: user_auth_schema_1.UserAuthSchema }])],
        providers: [maintenance_service_1.MaintenanceService],
    })
], MaintenanceModule);
//# sourceMappingURL=maintenance.module.js.map