import * as Joi from "joi"

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),

  // MongoDB
  MONGODB_URI: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default("7d"),

  // AWS (S3)
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default("us-east-1"),
  AWS_S3_BUCKET: Joi.string().required(),
  AWS_SNS_REGION: Joi.string().default("us-east-1"),
  AWS_SNS_API_VERSION: Joi.string().default("2010-03-31"),
  AWS_SNS_PLATFORM_APPLICATION_ARN_IOS: Joi.string().optional(),
  AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID: Joi.string().optional(),

  // MSG91 (OTP/SMS)
  MSG91_API_KEY: Joi.string().optional(),
  MSG91_OTP_TEMPLATE_ID: Joi.string().optional(),
  MSG91_SENDER_ID: Joi.string().optional(),
  MSG91_WA_TEMPLATE_ID: Joi.string().optional(),

  // Expo Push
  EXPO_PUSH_ENABLED: Joi.string().valid("true", "false").default("false"),

  // Invite
  INVITE_BASE_URL: Joi.string().uri().optional(),

  // WhatsApp Provider
  WHATSAPP_PROVIDER: Joi.string().valid("twilio", "msg91").optional(),
  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_WHATSAPP_FROM: Joi.string().optional(),

  // New Relic
  NEW_RELIC_ENABLED: Joi.string().valid("true", "false").default("true"),
  NEW_RELIC_LICENSE_KEY: Joi.string().optional(),
  NEW_RELIC_APP_NAME: Joi.string().optional(),
  NEW_RELIC_LOG_ENDPOINT: Joi.string().uri().optional(),

  // Analytics
  ANALYTICS_ENABLED: Joi.string().valid("true", "false").default("true"),
  GTM_SERVER_CONTAINER_URL: Joi.string().uri().optional(),
  GA4_MEASUREMENT_ID: Joi.string().optional(),
  GA4_API_SECRET: Joi.string().optional(),
})
