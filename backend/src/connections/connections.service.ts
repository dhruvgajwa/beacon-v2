import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import type { ConnectionDocument } from "./schemas/connection.schema"
import type { ConnectionRequestDocument } from "./schemas/connection-request.schema"
import type { UserProfileDocument } from "../profile/schemas/user-profile.schema"
import type { NotificationsService } from "../notifications/notifications.service"
import type { SendConnectionRequestDto } from "./dto/send-connection-request.dto"
import type { InviteTokenDocument } from "./schemas/invite-token.schema"
import crypto from "crypto"

@Injectable()
export class ConnectionsService {
  constructor(
    private connectionModel: Model<ConnectionDocument>,
    private connectionRequestModel: Model<ConnectionRequestDocument>,
    private userProfileModel: Model<UserProfileDocument>,
    private inviteTokenModel: Model<InviteTokenDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async getConnections(userId: string) {
    const connections = await this.connectionModel.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    })

    const connectionsWithUserInfo = await Promise.all(
      connections.map(async (connection) => {
        const otherUserId =
          connection.user1Id.toString() === userId.toString()
            ? connection.user2Id
            : connection.user1Id

        const otherUser = await this.userProfileModel.findById(otherUserId)
        if (!otherUser) {
          // Skip connections where user profile is not found
          return null
        }

        return {
          id: connection._id,
          name: otherUser.name,
          phoneNumber: otherUser.phoneNumber,
          profilePic: otherUser.profilePic,
          connectionType: connection.connectionType,
        }
      }),
    )

    return {
      connections: connectionsWithUserInfo.filter(Boolean),
    }
  }

  async getConnectionRequests(userId: string) {
    const requests = await this.connectionRequestModel
      .find({
        toId: userId,
      })
      .sort({ createdAt: -1 })

    const requestsWithSenderInfo = await Promise.all(
      requests.map(async (request) => {
        const sender = await this.userProfileModel.findById(request.fromId)
        if (!sender) {
          // Skip requests where sender profile is not found
          return null
        }
        return {
          id: request._id,
          from: {
            id: sender._id,
            name: sender.name,
            phoneNumber: sender.phoneNumber,
            profilePic: sender.profilePic,
          },
          createdAt: request.createdAt,
        }
      }),
    )

    return {
      requests: requestsWithSenderInfo.filter(Boolean),
    }
  }

  async sendConnectionRequest(fromId: string, sendConnectionRequestDto: SendConnectionRequestDto) {
    const { phoneNumber } = sendConnectionRequestDto

    const toUser = await this.userProfileModel.findOne({ phoneNumber })
    if (!toUser) throw new Error("User not found")

    const existingConnection = await this.connectionModel.findOne({
      $or: [
        { user1Id: fromId, user2Id: toUser._id },
        { user1Id: toUser._id, user2Id: fromId },
      ],
    })
    if (existingConnection) throw new Error("You are already connected with this user")

    const existingRequest = await this.connectionRequestModel.findOne({
      fromId,
      toId: toUser._id,
    })
    if (existingRequest) throw new Error("A connection request is already pending")

    const connectionRequest = new this.connectionRequestModel({
      fromId,
      toId: toUser._id,
      createdAt: new Date(),
    })
    await connectionRequest.save()

    const fromUser = await this.userProfileModel.findById(fromId)

    // Push to all recipient device tokens (Expo or generic)
    if (toUser.deviceTokens?.length) {
      for (const t of toUser.deviceTokens) {
        await this.notificationsService.sendPushNotification(
          t.token,
          "New Connection Request",
          `${fromUser?.name || "Someone"} wants to connect with you.`,
          { requestId: connectionRequest._id },
          t.tokenType || "generic",
        )
      }
    }

    return { message: "Connection request sent successfully", requestId: connectionRequest._id }
  }

  async acceptConnectionRequest(userId: string, requestId: string) {
    const request = await this.connectionRequestModel.findById(requestId)
    if (!request) throw new Error("Request not found")
    if (request.toId.toString() !== userId.toString()) throw new Error("Unauthorized")

    const connection = new this.connectionModel({
      user1Id: request.fromId,
      user2Id: request.toId,
      connectionType: 0,
      createdAt: new Date(),
    })
    await connection.save()

    await this.connectionRequestModel.findByIdAndDelete(requestId)

    const fromUser = await this.userProfileModel.findById(request.fromId)
    const toUser = await this.userProfileModel.findById(request.toId)

    if (fromUser?.deviceTokens?.length) {
      for (const t of fromUser.deviceTokens) {
        await this.notificationsService.sendPushNotification(
          t.token,
          "Connection Request Accepted",
          `${toUser?.name || "Someone"} accepted your connection request.`,
          { connectionId: connection._id },
          t.tokenType || "generic",
        )
      }
    }

    return { message: "Connection request accepted successfully", connectionId: connection._id }
  }

  async rejectConnectionRequest(userId: string, requestId: string) {
    const request = await this.connectionRequestModel.findById(requestId)
    if (!request) throw new Error("Request not found")
    if (request.toId.toString() !== userId.toString()) throw new Error("Unauthorized")

    await this.connectionRequestModel.findByIdAndDelete(requestId)

    return { message: "Connection request rejected successfully" }
  }

  // NEW: update connectionType (0=default, 1=close, 2=very_close)
  async updateConnectionType(userId: string, connectionId: string, connectionType: number) {
    const conn = await this.connectionModel.findById(connectionId)
    if (!conn) throw new Error("Connection not found")
    if (
      conn.user1Id.toString() !== userId.toString() &&
      conn.user2Id.toString() !== userId.toString()
    ) {
      throw new Error("Unauthorized")
    }
    conn.connectionType = connectionType
    await conn.save()
    return { message: "Connection type updated", connectionType }
  }

  // NEW: shareable connection link
  async createInviteLink(inviterId: string) {
    const token = crypto.randomBytes(16).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await this.inviteTokenModel.create({ token, inviterId, expiresAt })
    return { token }
  }

  async acceptInviteToken(inviteeId: string, token: string) {
    const record = await this.inviteTokenModel.findOne({ token })
    if (!record) throw new Error("Invalid or expired invite")

    // If connection already exists, ignore
    const existing = await this.connectionModel.findOne({
      $or: [
        { user1Id: record.inviterId, user2Id: inviteeId },
        { user2Id: record.inviterId, user1Id: inviteeId },
      ],
    })
    if (!existing) {
      const connection = new this.connectionModel({
        user1Id: record.inviterId,
        user2Id: inviteeId,
        connectionType: 0,
        createdAt: new Date(),
      })
      await connection.save()
    }

    await this.inviteTokenModel.deleteOne({ _id: record._id })
    return { message: "Connected successfully via invite" }
  }

  // NEW: batch lookup (existing)
  async lookupContacts(fromId: string, phoneNumbers: string[]) {
    const profiles = await this.userProfileModel.find({ phoneNumber: { $in: phoneNumbers } })
    const phoneToProfile = new Map<string, any>()
    const profileIds: string[] = []
    for (const p of profiles) {
      phoneToProfile.set(p.phoneNumber, p)
      profileIds.push((p as any)._id.toString())
    }

    const connections = await this.connectionModel.find({
      $or: [
        { user1Id: fromId, user2Id: { $in: profileIds } },
        { user2Id: fromId, user1Id: { $in: profileIds } },
      ],
    })
    const connectedSet = new Set<string>()
    for (const c of connections) {
      const otherId =
        c.user1Id.toString() === fromId.toString() ? c.user2Id.toString() : c.user1Id.toString()
      const profile = profiles.find((p) => (p as any)._id.toString() === otherId)
      if (profile) connectedSet.add(profile.phoneNumber)
    }

    const pendingOutgoing = await this.connectionRequestModel.find({
      fromId,
      toId: { $in: profileIds },
    })
    const pendingOutgoingSet = new Set<string>()
    for (const r of pendingOutgoing) {
      const profile = profiles.find((p) => (p as any)._id.toString() === r.toId.toString())
      if (profile) pendingOutgoingSet.add(profile.phoneNumber)
    }

    const pendingIncoming = await this.connectionRequestModel.find({
      toId: fromId,
      fromId: { $in: profileIds },
    })
    const pendingIncomingSet = new Set<string>()
    for (const r of pendingIncoming) {
      const profile = profiles.find((p) => (p as any)._id.toString() === r.fromId.toString())
      if (profile) pendingIncomingSet.add(profile.phoneNumber)
    }

    const results = phoneNumbers.map((phone) => {
      if (!phoneToProfile.has(phone)) {
        return { phoneNumber: phone, status: "not_registered" as const }
      }
      if (connectedSet.has(phone)) return { phoneNumber: phone, status: "connected" as const }
      if (pendingOutgoingSet.has(phone))
        return { phoneNumber: phone, status: "pending_outgoing" as const }
      if (pendingIncomingSet.has(phone))
        return { phoneNumber: phone, status: "pending_incoming" as const }
      return { phoneNumber: phone, status: "available" as const }
    })

    return { results }
  }

  // NEW: pass-through method to use NotificationsService for sending SMS
  async sendSmsInvite(phoneNumber: string, message: string) {
    return this.notificationsService.sendSms(phoneNumber, message)
  }

  // NEW: pass-through method to use NotificationsService for sending WhatsApp
  async sendWhatsAppInvite(phoneNumber: string, message: string) {
    return this.notificationsService.sendSms(phoneNumber, message)
  }
}
