import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type UserAuthDocument = UserAuth & Document

@Schema()
export class UserAuth {
  @Prop({ required: true })
  phoneNumber: string

  @Prop()
  name: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile" })
  userProfileId: MongooseSchema.Types.ObjectId

  @Prop()
  otp: string

  @Prop()
  authToken: string

  // Pending phone update flow
  @Prop()
  phoneUpdateNewNumber?: string

  @Prop()
  phoneUpdateOtp?: string

  @Prop()
  phoneUpdateOtpExpiresAt?: Date

  // OTP state for deletion
  @Prop()
  deleteOtp?: string

  @Prop()
  deleteOtpExpiresAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth)
