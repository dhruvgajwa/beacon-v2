declare const _default: () => {
    port: number;
    database: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3: {
            bucket: string;
        };
        sns: {
            region: string;
            apiVersion: string;
            platformApplicationArn: {
                ios: string;
                android: string;
            };
        };
    };
    msg91: {
        apiKey: string;
        otpTemplateId: string;
        senderId: string;
    };
    expoPush: {
        enabled: boolean;
    };
    invite: {
        baseUrl: string;
    };
    whatsapp: {
        provider: string;
        twilio: {
            accountSid: string;
            authToken: string;
            from: string;
        };
        msg91: {
            templateId: string;
        };
    };
    newRelic: {
        licenseKey: string;
        appName: string;
        logEndpoint: string;
        enabled: boolean;
    };
    analytics: {
        gtmServerUrl: string;
        ga4MeasurementId: string;
        ga4ApiSecret: string;
        enabled: boolean;
    };
};
export default _default;
