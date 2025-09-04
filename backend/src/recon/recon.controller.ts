import { Controller, Post, Body, UseGuards, Get, Param, Req } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { ReconService } from "./recon.service"
import type { ReconDto } from "./dto/recon.dto"
import type { PingDto } from "./dto/ping.dto"

@Controller("recon")
export class ReconController {
  constructor(private readonly reconService: ReconService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async recon(@Req() req, @Body() reconDto: ReconDto) {
    return this.reconService.recon(req.user.profileId, reconDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post("ping")
  async ping(@Req() req, @Body() pingDto: PingDto) {
    return this.reconService.ping(req.user.profileId, pingDto.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("accept-ping/:requestId")
  async acceptPing(@Param("requestId") requestId: string, @Req() req) {
    return this.reconService.acceptPing(req.user.profileId, requestId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("reject-ping/:requestId")
  async rejectPing(@Param("requestId") requestId: string, @Req() req) {
    return this.reconService.rejectPing(req.user.profileId, requestId)
  }

  @UseGuards(JwtAuthGuard)
  @Get("ping-requests")
  async getPingRequests(@Req() req) {
    return this.reconService.getPingRequests(req.user.profileId)
  }

  // PRD alias routes [^3]
  @UseGuards(JwtAuthGuard)
  @Post("accept-recon-request")
  async acceptReconAlias(@Req() req, @Body() body: { requestId: string }) {
    return this.reconService.acceptPing(req.user.profileId, body.requestId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("reject-recon-request")
  async rejectReconAlias(@Req() req, @Body() body: { requestId: string }) {
    return this.reconService.rejectPing(req.user.profileId, body.requestId)
  }
}
