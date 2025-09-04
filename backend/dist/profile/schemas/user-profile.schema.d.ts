import { type Document, Schema as MongooseSchema } from "mongoose";
export type UserProfileDocument = UserProfile & Document;
export declare class UserProfile {
    name: string;
    phoneNumber: string;
    profilePic: string;
    bio: string;
    interests: string[];
    userAuthId: MongooseSchema.Types.ObjectId;
    lastLocation: {
        type: string;
        coordinates: number[];
    };
    deviceTokens: {
        token: string;
        platform: "ios" | "android";
        tokenType?: "expo" | "generic" | "sns";
        createdAt: Date;
    }[];
    snooze: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserProfileSchema: MongooseSchema<UserProfile, import("mongoose").Model<UserProfile, any, any, any, Document<unknown, any, UserProfile, any, {}> & UserProfile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserProfile, Document<unknown, {}, import("mongoose").FlatRecord<UserProfile>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserProfile> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
