import {
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Body,
  Req,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { ProfileService } from "./profile.service"
import type { UpdateProfileDto } from "./dto/update-profile.dto"
import type { UpdateNumberDto } from "./dto/update-number.dto"
import type { VerifyUpdateNumberDto } from "./dto/verify-update-number.dto"
import type { VerifyDeleteProfileDto } from "./dto/verify-delete-profile.dto"
import type { UpdateLocationDto } from "./dto/update-location.dto"
import type { RegisterDeviceTokenDto } from "./dto/register-device-token.dto"

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.profileId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("update-profile-photo")
  @UseInterceptors(FileInterceptor("profilePicture"))
  async updateProfilePhoto(@Req() req, @UploadedFile() file) {
    return this.profileService.updateProfilePhoto(req.user.profileId, file)
  }

  @UseGuards(JwtAuthGuard)
  @Post("snooze")
  async toggleSnooze(@Req() req, @Body() body: { snooze: boolean }) {
    return this.profileService.toggleSnooze(req.user.profileId, body.snooze)
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.profileId, updateProfileDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post("update-location")
  async updateLocation(@Req() req, @Body() dto: UpdateLocationDto) {
    try {
      return await this.profileService.updateLocation(req.user.profileId, dto.location, dto.accuracy)
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to update location", HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("register-device-token")
  async registerDeviceToken(@Req() req, @Body() dto: RegisterDeviceTokenDto) {
    try {
      return await this.profileService.registerDeviceToken(
        req.user.profileId,
        dto.token,
        dto.platform,
        dto.tokenType || "generic",
      )
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to register device token", HttpStatus.BAD_REQUEST)
    }
  }

  // Export and clear data
  @UseGuards(JwtAuthGuard)
  @Get("export")
  async exportData(@Req() req) {
    return this.profileService.exportData(req.user.profileId, req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Post("clear-data")
  async clearData(@Req() req) {
    return this.profileService.clearData(req.user.profileId)
  }

  // OTP delete flow
  @UseGuards(JwtAuthGuard)
  @Post("request-OTP-delete-profile")
  async requestDeleteProfileOtp(@Req() req) {
    try {
      return await this.profileService.requestDeleteProfileOtp(req.user.sub)
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to request delete OTP", HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("verify-OTP-delete-profile")
  async verifyDeleteProfile(@Req() req, @Body() dto: VerifyDeleteProfileDto) {
    try {
      return await this.profileService.verifyAndDeleteProfile(req.user.profileId, req.user.sub, dto.otp)
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to verify delete OTP", HttpStatus.BAD_REQUEST)
    }
  }

  // Update number flow
  @UseGuards(JwtAuthGuard)
  @Post("update-number")
  async requestPhoneNumberUpdate(@Req() req, @Body() dto: UpdateNumberDto) {
    try {
      return await this.profileService.requestPhoneNumberUpdate(req.user.sub, dto.newPhoneNumber)
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to request number update", HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("verify-OTP-update-number")
  async verifyPhoneNumberUpdate(@Req() req, @Body() dto: VerifyUpdateNumberDto) {
    try {
      return await this.profileService.verifyPhoneNumberUpdate(req.user.sub, dto.otp)
    } catch (error: any) {
      throw new HttpException(error.message || "Failed to verify number update", HttpStatus.BAD_REQUEST)
    }
  }

  // Deprecated direct delete
  @UseGuards(JwtAuthGuard)
  @Delete("delete-profile")
  async deleteProfile() {
    throw new HttpException(
      "This endpoint is deprecated. Use /profile/request-OTP-delete-profile then /profile/verify-OTP-delete-profile",
      HttpStatus.BAD_REQUEST,
    )
  }
}
