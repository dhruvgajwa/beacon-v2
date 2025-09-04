import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { MaintenanceService } from "./maintenance.service"
import { UserAuth, UserAuthSchema } from "../auth/schemas/user-auth.schema"

@Module({
  imports: [MongooseModule.forFeature([{ name: UserAuth.name, schema: UserAuthSchema }])],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
