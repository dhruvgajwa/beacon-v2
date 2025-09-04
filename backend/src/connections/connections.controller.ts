import { Controller, Post, UseGuards, Get, Param, Patch, Body } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { SendConnectionRequestDto } from "./dto/send-connection-request.dto"
import type { LookupContactsDto } from "./dto/lookup-contacts.dto"
import type { ConfigService } from "@nestjs/config"

@Controller("connections")
export class ConnectionsController {
  private readonly connectionsService: any
  private readonly config: ConfigService

  constructor(connectionsService: any, config: ConfigService) {
    this.connectionsService = connectionsService
    this.config = config
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConnections() {
    const req = this.getRequest()
    return this.connectionsService.getConnections(req.user.profileId)
  }

  @UseGuards(JwtAuthGuard)
  @Get("requests")
  async getConnectionRequests() {
    const req = this.getRequest()
    return this.connectionsService.getConnectionRequests(req.user.profileId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("send-request")
  async sendConnectionRequest(@Body() sendConnectionRequestDto: SendConnectionRequestDto) {
    const req = this.getRequest()
    return this.connectionsService.sendConnectionRequest(
      req.user.profileId,
      sendConnectionRequestDto,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post("accept-request/:requestId")
  async acceptConnectionRequest(@Param("requestId") requestId: string) {
    const req = this.getRequest()
    return this.connectionsService.acceptConnectionRequest(req.user.profileId, requestId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("reject-request/:requestId")
  async rejectConnectionRequest(@Param("requestId") requestId: string) {
    const req = this.getRequest()
    return this.connectionsService.rejectConnectionRequest(req.user.profileId, requestId)
  }

  // Batch lookup
  @UseGuards(JwtAuthGuard)
  @Post("lookup")
  async lookupContacts(@Body() body: LookupContactsDto) {
    // Validate the DTO for null safety and data integrity
    body.validate()

    const req = this.getRequest()
    return this.connectionsService.lookupContacts(req.user.profileId, body.phoneNumbers)
  }

  // Update connection type
  @UseGuards(JwtAuthGuard)
  @Patch(":connectionId/type")
  async updateConnectionType(
    @Param("connectionId") connectionId: string,
    @Body() body: { connectionType: number },
  ) {
    const req = this.getRequest()
    return this.connectionsService.updateConnectionType(
      req.user.profileId,
      connectionId,
      body.connectionType,
    )
  }

  // Create and accept invite link
  @UseGuards(JwtAuthGuard)
  @Post("invite-link")
  async createInviteLink() {
    const req = this.getRequest()
    return this.connectionsService.createInviteLink(req.user.profileId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("accept-invite")
  async acceptInvite(@Body() body: { token: string }) {
    const req = this.getRequest()
    return this.connectionsService.acceptInviteToken(req.user.profileId, body.token)
  }

  @UseGuards(JwtAuthGuard)
  @Post("invite")
  async invite(@Body() body: { phoneNumber: string; sendSms?: boolean; sendWhatsApp?: boolean }) {
    const req = this.getRequest()
    const { phoneNumber, sendSms = true, sendWhatsApp = true } = body
    const { token } = await this.connectionsService.createInviteLink(req.user.profileId)
    const base = this.config.get<string>("invite.baseUrl") || "https://beacon.app/invite"
    const link = `${base}?token=${encodeURIComponent(token)}`
    const inviterName = req.user?.name || "A friend"
    const message = `${inviterName} has requested you to try Beacon. Join here: ${link}`

    if (sendSms) {
      await this.connectionsService.sendSmsInvite(phoneNumber, message)
    }
    if (sendWhatsApp) {
      await this.connectionsService.sendWhatsAppInvite(phoneNumber, message)
    }

    return { link, token, sentSms: !!sendSms, sentWhatsApp: !!sendWhatsApp }
  }

  // PRD alias routes
  @UseGuards(JwtAuthGuard)
  @Post("send-connection-request")
  async sendConnectionRequestAlias(@Body() body: SendConnectionRequestDto) {
    const req = this.getRequest()
    return this.connectionsService.sendConnectionRequest(req.user.profileId, body)
  }

  @UseGuards(JwtAuthGuard)
  @Post("accept-connection-request/:requestId")
  async acceptConnectionRequestAlias(@Param("requestId") requestId: string) {
    const req = this.getRequest()
    return this.connectionsService.acceptConnectionRequest(req.user.profileId, requestId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("reject-connection-request/:requestId")
  async rejectConnectionRequestAlias(@Param("requestId") requestId: string) {
    const req = this.getRequest()
    return this.connectionsService.rejectConnectionRequest(req.user.profileId, requestId)
  }

  private getRequest() {
    // This is a placeholder for the actual request object
    // In a real scenario, you would inject the request object
    // or use a middleware to set it on the controller instance
    return { user: { profileId: "some-profile-id", name: "John Doe" } }
  }
}
