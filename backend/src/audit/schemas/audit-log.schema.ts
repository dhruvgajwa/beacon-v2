import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Schema as MongooseSchema } from "mongoose"

export type AuditLogDocument = AuditLog & Document

@Schema({ collection: "audit_logs" })
export class AuditLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserAuth", required: true })
  userAuthId: MongooseSchema.Types.ObjectId

  @Prop({ required: true })
  action: string // e.g., request_phone_update, verify_phone_update, request_delete_account, verify_delete_account

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>

  @Prop({ default: Date.now })
  createdAt: Date
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)
