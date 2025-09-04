import { type Document, Schema as MongooseSchema } from "mongoose";
export type InviteTokenDocument = InviteToken & Document;
export declare class InviteToken {
    token: string;
    inviterId: MongooseSchema.Types.ObjectId;
    createdAt: Date;
    expiresAt: Date;
}
export declare const InviteTokenSchema: MongooseSchema<InviteToken, import("mongoose").Model<InviteToken, any, any, any, Document<unknown, any, InviteToken, any, {}> & InviteToken & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InviteToken, Document<unknown, {}, import("mongoose").FlatRecord<InviteToken>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<InviteToken> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
