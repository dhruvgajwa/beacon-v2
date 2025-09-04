import type { Document } from "mongoose";
export type OtpLogDocument = OtpLog & Document;
export declare class OtpLog {
    phoneNumber: string;
    createdAt: Date;
}
export declare const OtpLogSchema: import("mongoose").Schema<OtpLog, import("mongoose").Model<OtpLog, any, any, any, Document<unknown, any, OtpLog, any, {}> & OtpLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OtpLog, Document<unknown, {}, import("mongoose").FlatRecord<OtpLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<OtpLog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
