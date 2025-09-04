import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import type { JwtService } from "@nestjs/jwt"
import type { UserAuthDocument } from "./schemas/user-auth.schema"
import type { UserProfileDocument } from "../profile/schemas/user-profile.schema"
import type { SignupDto } from "./dto/signup.dto"
import type { LoginDto } from "./dto/login.dto"
import type { VerifyOtpDto } from "./dto/verify-otp.dto"
import type { NotificationsService } from "../notifications/notifications.service"
import type { OtpRateLimitService } from "./otp-rate-limit.service"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class AuthService {
  constructor(
    private userAuthModel: Model<UserAuthDocument>,
    private userProfileModel: Model<UserProfileDocument>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private otpRateLimit: OtpRateLimitService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userAuthModel.findOne({ phoneNumber: signupDto.phoneNumber })
    if (existingUser) {
      throw new Error("User already exists")
    }

    await this.otpRateLimit.assertCanSend(signupDto.phoneNumber)

    const otp = this.generateOtp()
    const userAuth = new this.userAuthModel({
      phoneNumber: signupDto.phoneNumber,
      name: signupDto.name,
      otp,
    })
    await userAuth.save()

    await this.notificationsService.sendOtp(signupDto.phoneNumber, otp, "signup")
    await this.otpRateLimit.logSend(signupDto.phoneNumber)

    return { message: "OTP sent successfully", userId: userAuth._id }
  }

  async verifyOtpSignup(verifyOtpDto: VerifyOtpDto) {
    const userAuth = await this.userAuthModel.findById(verifyOtpDto.userId)
    if (!userAuth) throw new Error("User not found")
    if (userAuth.otp !== verifyOtpDto.otp) throw new Error("Invalid OTP")

    // clear OTP
    userAuth.otp = null
    await userAuth.save()

    const userProfile = new this.userProfileModel({
      name: userAuth.name,
      phoneNumber: userAuth.phoneNumber,
      userAuthId: userAuth._id,
    })
    await userProfile.save()

    userAuth.userProfileId = userProfile._id
    // Persist auth token per PRD
    const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id })
    userAuth.authToken = token
    await userAuth.save()

    return {
      token,
      user: {
        id: userProfile._id,
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        profilePic: userProfile.profilePic,
        snooze: userProfile.snooze,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const userAuth = await this.userAuthModel.findOne({ phoneNumber: loginDto.phoneNumber })

    await this.otpRateLimit.assertCanSend(loginDto.phoneNumber)

    if (!userAuth) {
      const otp = this.generateOtp()
      const newAuth = new this.userAuthModel({ phoneNumber: loginDto.phoneNumber, name: "", otp })
      await newAuth.save()
      await this.notificationsService.sendOtp(loginDto.phoneNumber, otp, "login")
      await this.otpRateLimit.logSend(loginDto.phoneNumber)
      return { message: "OTP sent successfully", userId: newAuth._id }
    }

    const otp = this.generateOtp()
    userAuth.otp = otp
    await userAuth.save()

    await this.notificationsService.sendOtp(loginDto.phoneNumber, otp, "login")
    await this.otpRateLimit.logSend(loginDto.phoneNumber)

    return { message: "OTP sent successfully", userId: userAuth._id }
  }

  async verifyOtpLogin(verifyOtpDto: VerifyOtpDto) {
    const userAuth = await this.userAuthModel.findById(verifyOtpDto.userId)
    if (!userAuth) throw new Error("User not found")
    if (userAuth.otp !== verifyOtpDto.otp) throw new Error("Invalid OTP")

    userAuth.otp = null

    const userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id })
    if (!userProfile) throw new Error("User profile not found")

    const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id })
    userAuth.authToken = token // rotate stored JWT per PRD [^2]
    await userAuth.save()

    return {
      token,
      user: {
        id: userProfile._id,
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        profilePic: userProfile.profilePic,
        snooze: userProfile.snooze,
      },
    }
  }

  async resendOtp(phoneNumber: string, type: "signup" | "login") {
    const userAuth = await this.userAuthModel.findOne({ phoneNumber })
    if (!userAuth) throw new Error("User not found")

    await this.otpRateLimit.assertCanSend(phoneNumber)

    const otp = this.generateOtp()
    userAuth.otp = otp
    await userAuth.save()

    await this.notificationsService.sendOtp(phoneNumber, otp, `resend_${type}`)
    await this.otpRateLimit.logSend(phoneNumber)

    return { message: "OTP resent successfully", userId: userAuth._id }
  }

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  async validateUser(userId: string): Promise<any> {
    const userAuth = await this.userAuthModel.findById(userId)
    if (!userAuth) return null

    const userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id })
    if (!userProfile) return null

    return {
      id: userProfile._id,
      name: userProfile.name,
      phoneNumber: userProfile.phoneNumber,
    }
  }

  async verifyMsg91Token(msg91Token: string, name?: string) {
    const apiKey = this.configService.get<string>("msg91.apiKey")
    if (!apiKey) throw new Error("MSG91 API key not configured")

    const res = await fetch("https://control.msg91.com/api/v5/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json", authkey: apiKey } as any,
      body: JSON.stringify({ token: msg91Token }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to verify OTP token: ${text}`)
    }

    const data: any = await res.json()
    const rawMobile: string | undefined = data?.mobile || data?.phone || data?.data?.mobile
    if (!rawMobile) throw new Error("Phone number not found in MSG91 verification response")

    const e164 = rawMobile.startsWith("+") ? rawMobile : `+${rawMobile}`

    let userAuth = await this.userAuthModel.findOne({ phoneNumber: e164 })
    if (!userAuth) {
      userAuth = new this.userAuthModel({ phoneNumber: e164, name: name || "" })
      await userAuth.save()
    }

    let userProfile = await this.userProfileModel.findOne({ userAuthId: userAuth._id })
    if (!userProfile) {
      userProfile = new this.userProfileModel({
        name: userAuth.name || name || "User",
        phoneNumber: e164,
        userAuthId: userAuth._id,
      })
      await userProfile.save()
      userAuth.userProfileId = userProfile._id
      await userAuth.save()
    } else if (name && !userProfile.name) {
      userProfile.name = name
      await userProfile.save()
    }

    const token = this.jwtService.sign({ sub: userAuth._id, profileId: userProfile._id })
    userAuth.authToken = token // persist to user_auth per PRD [^2]
    await userAuth.save()

    return {
      token,
      user: {
        id: userProfile._id,
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        profilePic: userProfile.profilePic,
        snooze: userProfile.snooze,
      },
    }
  }
}
