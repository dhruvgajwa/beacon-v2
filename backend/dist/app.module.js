"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const profile_module_1 = require("./profile/profile.module");
const recon_module_1 = require("./recon/recon.module");
const connections_module_1 = require("./connections/connections.module");
const notifications_module_1 = require("./notifications/notifications.module");
const maintenance_module_1 = require("./maintenance/maintenance.module");
const newrelic_module_1 = require("./monitoring/newrelic.module");
const analytics_module_1 = require("./analytics/analytics.module");
const configuration_1 = require("./config/configuration");
const validation_schema_1 = require("./config/validation.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: validation_schema_1.validationSchema,
                validationOptions: { abortEarly: true },
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get("database.uri"),
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            profile_module_1.ProfileModule,
            recon_module_1.ReconModule,
            connections_module_1.ConnectionsModule,
            notifications_module_1.NotificationsModule,
            maintenance_module_1.MaintenanceModule,
            newrelic_module_1.NewRelicModule,
            analytics_module_1.AnalyticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map