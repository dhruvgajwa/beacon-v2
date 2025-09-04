import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ProfileController } from "./profile.controller"
import { ProfileService } from "./profile.service"
import { UserProfile, UserProfileSchema } from "./schemas/user-profile.schema"
import { UserAuth, UserAuthSchema } from "../auth/schemas/user-auth.schema"
import { Connection, ConnectionSchema } from "../connections/schemas/connection.schema"
import { ConnectionRequest, ConnectionRequestSchema } from "../connections/schemas/connection-request.schema"
import { ReconRequest, ReconRequestSchema } from "../recon/schemas/recon-request.schema"
import { NotificationsModule } from "../notifications/notifications.module"
import { AuditLog, AuditLogSchema } from "../audit/schemas/audit-log.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: ConnectionRequest.name, schema: ConnectionRequestSchema },
      { name: ReconRequest.name, schema: ReconRequestSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
