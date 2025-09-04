import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ReconRequestDocument = ReconRequest & Document

@Schema()
export class ReconRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  fromId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  toId: MongooseSchema.Types.ObjectId

  @Prop({ enum: ["pending", "accepted", "rejected"], default: "pending" })
  status: string

  @Prop({ required: true })
  createdAt: Date

  @Prop({ required: true })
  expiresAt: Date
}

export const ReconRequestSchema = SchemaFactory.createForClass(ReconRequest)

// TTL index to auto-remove expired recon requests
ReconRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
