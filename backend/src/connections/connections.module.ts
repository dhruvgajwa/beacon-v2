import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConnectionsController } from "./connections.controller"
import { ConnectionsService } from "./connections.service"
import { Connection, ConnectionSchema } from "./schemas/connection.schema"
import { ConnectionRequest, ConnectionRequestSchema } from "./schemas/connection-request.schema"
import { UserProfile, UserProfileSchema } from "../profile/schemas/user-profile.schema"
import { NotificationsModule } from "../notifications/notifications.module"
import { InviteToken, InviteTokenSchema } from "./schemas/invite-token.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connection.name, schema: ConnectionSchema },
      { name: ConnectionRequest.name, schema: ConnectionRequestSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: InviteToken.name, schema: InviteTokenSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
