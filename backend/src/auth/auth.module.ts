import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { UserAuth, UserAuthSchema } from "./schemas/user-auth.schema"
import { UserProfile, UserProfileSchema } from "../profile/schemas/user-profile.schema"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { NotificationsModule } from "../notifications/notifications.module"
import { OtpLog, OtpLogSchema } from "./schemas/otp-log.schema"
import { OtpRateLimitService } from "./otp-rate-limit.service"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: OtpLog.name, schema: OtpLogSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: { expiresIn: configService.get<string>("jwt.expiresIn") },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpRateLimitService],
  exports: [AuthService],
})
export class AuthModule {}
