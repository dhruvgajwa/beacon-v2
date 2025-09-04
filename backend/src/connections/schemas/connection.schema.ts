import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type ConnectionDocument = Connection & Document

@Schema()
export class Connection {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  user1Id: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserProfile", required: true })
  user2Id: MongooseSchema.Types.ObjectId

  @Prop({ default: 0 })
  connectionType: number

  @Prop({ default: Date.now })
  createdAt: Date
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection)

// Add compound index for faster lookups
ConnectionSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true })
