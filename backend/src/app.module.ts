import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { ScheduleModule } from "@nestjs/schedule"
import { AuthModule } from "./auth/auth.module"
import { ProfileModule } from "./profile/profile.module"
import { ReconModule } from "./recon/recon.module"
import { ConnectionsModule } from "./connections/connections.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { MaintenanceModule } from "./maintenance/maintenance.module"
import { NewRelicModule } from "./monitoring/newrelic.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import configuration from "./config/configuration"
import { validationSchema } from "./config/validation.schema"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("database.uri"),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ProfileModule,
    ReconModule,
    ConnectionsModule,
    NotificationsModule,
    MaintenanceModule,
    NewRelicModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
