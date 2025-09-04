import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type OtpLogDocument = OtpLog & Document

@Schema({ collection: "otp_logs" })
export class OtpLog {
  @Prop({ required: true })
  phoneNumber: string

  @Prop({ default: Date.now, index: true })
  createdAt: Date
}

export const OtpLogSchema = SchemaFactory.createForClass(OtpLog)
// TTL: auto-expire logs after 15 minutes (window)
OtpLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15 * 60 })
