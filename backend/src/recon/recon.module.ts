import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ReconController } from "./recon.controller"
import { ReconService } from "./recon.service"
import { UserProfile, UserProfileSchema } from "../profile/schemas/user-profile.schema"
import { ReconRequest, ReconRequestSchema } from "./schemas/recon-request.schema"
import { Connection, ConnectionSchema } from "../connections/schemas/connection.schema"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: ReconRequest.name, schema: ReconRequestSchema },
      { name: Connection.name, schema: ConnectionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ReconController],
  providers: [ReconService],
})
export class ReconModule {}
