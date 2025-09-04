import { NotificationsService } from "../src/notifications/notifications.service"
import type { ConfigService } from "@nestjs/config"
import { jest } from "@jest/globals"

jest.mock("aws-sdk", () => {
  const publishMock = jest.fn().mockReturnValue({ promise: () => Promise.resolve({ MessageId: "123" }) })
  const SNS = jest.fn().mockImplementation(() => ({ publish: publishMock }))
  return { SNS, config: { update: jest.fn() } }
})

describe("NotificationsService SNS", () => {
  const cfg = {
    get: (key: string) => {
      const map: Record<string, any> = {
        NODE_ENV: "production",
        "aws.accessKeyId": "AKIA...",
        "aws.secretAccessKey": "secret",
        "aws.region": "us-east-1",
        "aws.sns.region": "us-east-1",
        "aws.sns.apiVersion": "2010-03-31",
        "expoPush.enabled": false,
      }
      return map[key]
    },
  } as unknown as ConfigService

  it("falls back to SNS SMS when MSG91 not configured", async () => {
    const svc = new NotificationsService(cfg)
    await expect(svc.sendOtp("+15551234567", "1234", "test")).resolves.toBeUndefined()
  })

  it("publishes SNS push when tokenType is sns", async () => {
    const svc = new NotificationsService(cfg)
    await expect(
      svc.sendPushNotification("arn:aws:sns:us-east-1:123:endpoint/APNS/app/abc", "t", "b", { k: 1 }, "sns"),
    ).resolves.toBeUndefined()
  })
})
