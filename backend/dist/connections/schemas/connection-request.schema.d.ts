import { type Document, Schema as MongooseSchema } from "mongoose";
export type ConnectionRequestDocument = ConnectionRequest & Document;
export declare class ConnectionRequest {
    fromId: MongooseSchema.Types.ObjectId;
    toId: MongooseSchema.Types.ObjectId;
    createdAt: Date;
}
export declare const ConnectionRequestSchema: MongooseSchema<ConnectionRequest, import("mongoose").Model<ConnectionRequest, any, any, any, Document<unknown, any, ConnectionRequest, any, {}> & ConnectionRequest & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ConnectionRequest, Document<unknown, {}, import("mongoose").FlatRecord<ConnectionRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ConnectionRequest> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
