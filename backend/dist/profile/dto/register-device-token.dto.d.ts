export declare class RegisterDeviceTokenDto {
    token: string;
    platform: "ios" | "android";
    tokenType?: "expo" | "generic" | "sns";
}
