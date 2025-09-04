import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type UserProfileDocument = UserProfile & Document

@Schema()
export class UserProfile {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  phoneNumber: string

  @Prop()
  profilePic: string

  @Prop({ default: "" })
  bio: string

  @Prop({ type: [String], default: [] })
  interests: string[]

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserAuth", required: true })
  userAuthId: MongooseSchema.Types.ObjectId

  @Prop({
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  lastLocation: {
    type: string
    coordinates: number[]
  }

  @Prop({
    type: [
      {
        token: { type: String, required: true },
        platform: { type: String, enum: ["ios", "android"], required: true },
        tokenType: { type: String, enum: ["expo", "generic", "sns"], default: "generic" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  deviceTokens: {
    token: string
    platform: "ios" | "android"
    tokenType?: "expo" | "generic" | "sns"
    createdAt: Date
  }[]

  @Prop({ default: false })
  snooze: boolean

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile)
UserProfileSchema.index({ lastLocation: "2dsphere" })
