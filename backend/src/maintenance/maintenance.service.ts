import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { Model } from "mongoose"
import type { UserAuthDocument } from "../auth/schemas/user-auth.schema"

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name)

  private userAuthModel: Model<UserAuthDocument>

  constructor(userAuthModel: Model<UserAuthDocument>) {
    this.userAuthModel = userAuthModel
  }

  // Run hourly to clean expired OTP fields for phone update and delete-account
  @Cron(CronExpression.EVERY_HOUR)
  async clearExpiredOtps() {
    const now = new Date()
    const res = await this.userAuthModel.updateMany(
      {
        $or: [{ phoneUpdateOtpExpiresAt: { $lt: now } }, { deleteOtpExpiresAt: { $lt: now } }],
      },
      {
        $unset: {
          phoneUpdateOtp: "",
          phoneUpdateOtpExpiresAt: "",
          phoneUpdateNewNumber: "",
          deleteOtp: "",
          deleteOtpExpiresAt: "",
        },
      },
    )
    this.logger.log(`Cleared stale OTP fields for ${res.modifiedCount} auth records`)
  }
}
