import { type Document, Schema as MongooseSchema } from "mongoose";
export type UserAuthDocument = UserAuth & Document;
export declare class UserAuth {
    phoneNumber: string;
    name: string;
    userProfileId: MongooseSchema.Types.ObjectId;
    otp: string;
    authToken: string;
    phoneUpdateNewNumber?: string;
    phoneUpdateOtp?: string;
    phoneUpdateOtpExpiresAt?: Date;
    deleteOtp?: string;
    deleteOtpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserAuthSchema: MongooseSchema<UserAuth, import("mongoose").Model<UserAuth, any, any, any, Document<unknown, any, UserAuth, any, {}> & UserAuth & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserAuth, Document<unknown, {}, import("mongoose").FlatRecord<UserAuth>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserAuth> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
