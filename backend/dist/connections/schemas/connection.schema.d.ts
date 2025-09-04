import { type Document, Schema as MongooseSchema } from "mongoose";
export type ConnectionDocument = Connection & Document;
export declare class Connection {
    user1Id: MongooseSchema.Types.ObjectId;
    user2Id: MongooseSchema.Types.ObjectId;
    connectionType: number;
    createdAt: Date;
}
export declare const ConnectionSchema: MongooseSchema<Connection, import("mongoose").Model<Connection, any, any, any, Document<unknown, any, Connection, any, {}> & Connection & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Connection, Document<unknown, {}, import("mongoose").FlatRecord<Connection>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Connection> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
