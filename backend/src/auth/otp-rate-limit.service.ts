import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import type { OtpLogDocument } from "./schemas/otp-log.schema"

@Injectable()
export class OtpRateLimitService {
  private otpLogModel: Model<OtpLogDocument>

  constructor(otpLogModel: Model<OtpLogDocument>) {
    this.otpLogModel = otpLogModel
  }

  // Rules: max 5 sends per 15 minutes; cooldown 60s between sends
  private MAX_PER_WINDOW = 5
  private COOLDOWN_MS = 60 * 1000

  async assertCanSend(phoneNumber: string) {
    const since = new Date(Date.now() - 15 * 60 * 1000)
    const logs = await this.otpLogModel
      .find({ phoneNumber, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(10)

    if (logs.length >= this.MAX_PER_WINDOW) {
      throw new Error("Too many OTP requests. Please try again later.")
    }
    if (logs[0] && Date.now() - logs[0].createdAt.getTime() < this.COOLDOWN_MS) {
      throw new Error("Please wait a minute before requesting another OTP.")
    }
  }

  async logSend(phoneNumber: string) {
    await this.otpLogModel.create({ phoneNumber })
  }
}
