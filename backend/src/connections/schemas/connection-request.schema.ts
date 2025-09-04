import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ConnectionRequestDocument = ConnectionRequest & Document

@Schema()
export class ConnectionRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  fromId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  toId: MongooseSchema.Types.ObjectId

  @Prop({ default: Date.now })
  createdAt: Date
}

export const ConnectionRequestSchema = SchemaFactory.createForClass(ConnectionRequest)

// Add compound index for faster lookups
ConnectionRequestSchema.index({ fromId: 1, toId: 1 }, { unique: true })
