import { Injectable, Logger } from "@nestjs/common"
import * as AWS from "aws-sdk"
import type { ConfigService } from "@nestjs/config"

type TokenType = "expo" | "generic" | "sns"

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private sns: AWS.SNS
  private expoPushEnabled: boolean
  private snsRegion: string

  constructor(private readonly config: ConfigService) {
    AWS.config.update({
      accessKeyId: this.config.get<string>("aws.accessKeyId"),
      secretAccessKey: this.config.get<string>("aws.secretAccessKey"),
      region: this.config.get<string>("aws.region"),
    })
    this.snsRegion = this.config.get<string>("aws.sns.region") || "us-east-1"
    this.sns = new AWS.SNS({
      apiVersion: this.config.get<string>("aws.sns.apiVersion") || "2010-03-31",
      region: this.snsRegion,
    })
    this.expoPushEnabled = !!this.config.get<boolean>("expoPush.enabled")
  }

  // Push notifications
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    tokenType: TokenType = "generic",
  ) {
    try {
      if (tokenType === "sns") {
        return await this.sendSnsPush(token, title, body, data)
      }
      // Fallback: try SNS direct with raw device token by creating endpoint on the fly is not supported here.
      // If you want auto endpoint creation, use profile/register-device-token with tokenType="sns". [^3]
      // Otherwise, you can integrate Expo push (server-side) if desired later.
      this.logger.warn(`Unsupported tokenType for server push: ${tokenType}. Consider registering SNS endpoint.`)
      return { ok: false }
    } catch (err) {
      this.logger.error("sendPushNotification failed", err as Error)
      return { ok: false }
    }
  }

  private async sendSnsPush(endpointArn: string, title: string, body: string, data?: Record<string, any>) {
    // Build platform-specific payloads
    const apnsPayload = {
      aps: {
        alert: { title, body },
        sound: "default",
        "content-available": 1,
      },
      data: { ...(data || {}) },
    }
    const fcmPayload = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v)])),
    }

    const message = {
      default: body,
      APNS: JSON.stringify({ aps: apnsPayload.aps, data: apnsPayload.data }),
      APNS_SANDBOX: JSON.stringify({ aps: apnsPayload.aps, data: apnsPayload.data }),
      GCM: JSON.stringify(fcmPayload),
    }

    const params: AWS.SNS.PublishInput = {
      Message: JSON.stringify(message),
      MessageStructure: "json",
      TargetArn: endpointArn,
    }

    const res = await this.sns.publish(params).promise()
    return { ok: true, messageId: res.MessageId }
  }

  // SMS via SNS
  async sendSms(phoneNumber: string, message: string) {
    try {
      const res = await this.sns
        .publish({
          Message: message,
          PhoneNumber: phoneNumber,
        })
        .promise()
      return { ok: true, messageId: res.MessageId }
    } catch (err) {
      this.logger.error("sendSms failed", err as Error)
      return { ok: false }
    }
  }

  // OTP helper used elsewhere in the app [^3]
  async sendOtp(phoneNumber: string, otp: string, purpose: "signup" | "login" | "update_number" | "delete_account") {
    const message = `Your Beacon OTP is ${otp}. Purpose: ${purpose}. This code will expire in 10 minutes.`
    return this.sendSms(phoneNumber, message)
  }
}
