import { type Document, Schema as MongooseSchema } from "mongoose";
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    userAuthId: MongooseSchema.Types.ObjectId;
    action: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const AuditLogSchema: MongooseSchema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog, any, {}> & AuditLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditLog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
