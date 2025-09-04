"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: Number.parseInt(process.env.PORT, 10) || 3000,
    database: { uri: process.env.MONGODB_URI },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || "7d",
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || "us-east-1",
        s3: { bucket: process.env.AWS_S3_BUCKET },
        sns: {
            region: process.env.AWS_SNS_REGION || "us-east-1",
            apiVersion: process.env.AWS_SNS_API_VERSION || "2010-03-31",
            platformApplicationArn: {
                ios: process.env.AWS_SNS_PLATFORM_APPLICATION_ARN_IOS,
                android: process.env.AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID,
            },
        },
    },
    msg91: {
        apiKey: process.env.MSG91_API_KEY,
        otpTemplateId: process.env.MSG91_OTP_TEMPLATE_ID,
        senderId: process.env.MSG91_SENDER_ID,
    },
    expoPush: { enabled: process.env.EXPO_PUSH_ENABLED === "true" },
    invite: { baseUrl: process.env.INVITE_BASE_URL || "https://beacon.app/invite" },
    whatsapp: {
        provider: process.env.WHATSAPP_PROVIDER || "",
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            from: process.env.TWILIO_WHATSAPP_FROM,
        },
        msg91: {
            templateId: process.env.MSG91_WA_TEMPLATE_ID,
        },
    },
    newRelic: {
        licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
        appName: process.env.NEW_RELIC_APP_NAME || "beacon-backend",
        logEndpoint: process.env.NEW_RELIC_LOG_ENDPOINT || "https://log-api.newrelic.com/log/v1",
        enabled: process.env.NEW_RELIC_ENABLED === "true",
    },
    analytics: {
        gtmServerUrl: process.env.GTM_SERVER_CONTAINER_URL,
        ga4MeasurementId: process.env.GA4_MEASUREMENT_ID,
        ga4ApiSecret: process.env.GA4_API_SECRET,
        enabled: process.env.ANALYTICS_ENABLED !== "false",
    },
});
//# sourceMappingURL=configuration.js.map