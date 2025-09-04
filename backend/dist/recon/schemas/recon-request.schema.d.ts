import { type Document, Schema as MongooseSchema } from "mongoose";
export type ReconRequestDocument = ReconRequest & Document;
export declare class ReconRequest {
    fromId: MongooseSchema.Types.ObjectId;
    toId: MongooseSchema.Types.ObjectId;
    status: string;
    createdAt: Date;
    expiresAt: Date;
}
export declare const ReconRequestSchema: MongooseSchema<ReconRequest, import("mongoose").Model<ReconRequest, any, any, any, Document<unknown, any, ReconRequest, any, {}> & ReconRequest & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReconRequest, Document<unknown, {}, import("mongoose").FlatRecord<ReconRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ReconRequest> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
