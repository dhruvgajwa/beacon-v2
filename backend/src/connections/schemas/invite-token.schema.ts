import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type InviteTokenDocument = InviteToken & Document

@Schema({ collection: "invite_tokens" })
export class InviteToken {
  @Prop({ required: true, unique: true })
  token: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  inviterId: MongooseSchema.Types.ObjectId

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ required: true })
  expiresAt: Date
}

export const InviteTokenSchema = SchemaFactory.createForClass(InviteToken)
InviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
