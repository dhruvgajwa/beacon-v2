# Beacon Publish Guide (Backend #43; App)

This guide walks you through configuring, building, and publishing both the NestJS backend and the Expo (React Native) app.

## 1) Prerequisites

- MongoDB connection string (Cloud or self&#45;hosted)
- AWS account with:
  - S3 bucket for profile photos
  - SNS enabled, Platform Application ARNs for iOS and Android (if using SNS push)
- MSG91 account and OTP template configured (or use WhatsApp provider)
- New Relic account (for logs)
- GA4 Measurement ID and API Secret, or a GTM Server container URL if using server&#45;side Tag Manager
- GitHub repository with Actions enabled

Good practice: validate inputs and never trust client data directly when enforcing auth or permissions [^1].

## 2) Configure Backend Environment

Set the following environment variables (see backend/.env.example for the full list):

- App/Server
  - NODE_ENV, PORT
- Database
  - MONGODB_URI
- JWT
  - JWT_SECRET, JWT_EXPIRATION
- AWS
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  - AWS_S3_BUCKET
  - AWS_SNS_REGION, AWS_SNS_API_VERSION
  - AWS_SNS_PLATFORM_APPLICATION_ARN_IOS
  - AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID
- OTP (MSG91) or WhatsApp provider
  - MSG91_API_KEY, MSG91_OTP_TEMPLATE_ID, MSG91_SENDER_ID
  - WHATSAPP_PROVIDER, TWILIO_* (if provider=twilio), MSG91_WA_TEMPLATE_ID (if provider=msg91)
- Invite
  - INVITE_BASE_URL
- Analytics
  - ANALYTICS_ENABLED=true
  - GTM_SERVER_CONTAINER_URL (preferred), or GA4_MEASUREMENT_ID and GA4_API_SECRET
- New Relic
  - NEW_RELIC_ENABLED=true
  - NEW_RELIC_LICENSE_KEY
  - NEW_RELIC_APP_NAME (optional)
  - NEW_RELIC_LOG_ENDPOINT (optional)

## 3) Run Backend Locally

- Install dependencies:
  - cd backend
  - npm ci
- Start dev:
  - npm run start:dev
- Verify health:
  - curl http://localhost:3000 &#40;or your health route&#41;

## 4) Build #43; Push Docker Image (CI Provided)

This repo includes GitHub Actions at .github/workflows/backend&#45;docker.yml that:
- Builds and pushes a Docker image to GHCR on pushes to main affecting backend
- Uses tags for branch, sha, and latest (for default branch)

To trigger:
- Push to main or manually dispatch the workflow in GitHub Actions

## 5) Deploy Backend

Option A: Docker on VM/Kubernetes
- Pull the latest image from GHCR
- Run with environment variables (use secrets manager)
- Expose port 3000 behind a secure reverse proxy (TLS)

Option B: PaaS/Containers
- Configure app with the variables in section 2
- Mount persistent volumes if needed
- Ensure AWS, MongoDB reachability

## 6) App Configuration (Expo)

In app/.env or via EAS secrets/vars, set:
- API_URL pointing to your backend (e.g., https://api.example.com)
- APP_NAME
- MSG91_WIDGET_ID, MSG91_TOKEN_AUTH if using the MSG91 widget flow

Expo build via GitHub Actions (.github/workflows/app&#45;eas&#45;build.yml):
- Requires EXPO_TOKEN (secret) and API_URL (repo var)
- Triggers on tag push app&#45;v*

Local build:
- cd app
- npm ci
- npx expo login
- eas build &#45;&#45;platform ios/android

## 7) Push Notifications

- Expo push (optional): ensure EXPO_PUSH_ENABLED=true (backend config) and register device tokens as tokenType=expo
- SNS push (recommended): register device tokens with tokenType="sns" via /profile/register&#45;device&#45;token and pass raw APNs/FCM token; backend creates/stores SNS endpoint ARN.

## 8) Analytics

- Frontend posts to /analytics/track
- Backend forwards to your GTM Server container or GA4 Measurement Protocol
- Avoid sending PII; both client and server redact common sensitive keys [^1]

## 9) New Relic Logs

- Set NEW_RELIC_* variables
- The backend Logging Interceptor sends redacted http_request logs to New Relic Log API
- Verify in New Relic Logs UI

## 10) Final Checklist

- [ ] Environment variables set in production
- [ ] MongoDB indexes created (2dsphere for lastLocation; TTL where used)
- [ ] AWS IAM permissions for S3 and SNS
- [ ] OTP provider verified templates
- [ ] Reverse proxy and TLS in place
- [ ] Secrets rotated and stored in a secrets manager
- [ ] App built with correct API_URL
- [ ] Push tested on real devices
- [ ] Analytics events visible in GTM/GA
- [ ] New Relic logs visible

Security note: Always authorize actions on the server and never rely on client flags or params alone [^1].

[^1]: Guides: Data Security | Next.js
