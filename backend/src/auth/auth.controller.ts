import { Controller, Post, HttpException, HttpStatus } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { SignupDto } from "./dto/signup.dto"
import type { LoginDto } from "./dto/login.dto"
import type { VerifyOtpDto } from "./dto/verify-otp.dto"
import type { ResendOtpDto } from "./dto/resend-otp.dto"
import type { VerifyMsg91Dto } from "./dto/verify-msg91.dto"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(signupDto: SignupDto) {
    try {
      return await this.authService.signup(signupDto)
    } catch (error) {
      if ((error as Error).message === "User already exists") {
        throw new HttpException("User already exists", HttpStatus.CONFLICT)
      }
      throw new HttpException("Failed to signup", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post("verify-otp-signup")
  async verifyOtpSignup(verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtpSignup(verifyOtpDto)
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post("login")
  async login(loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto)
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post("verify-otp-login")
  async verifyOtpLogin(verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtpLogin(verifyOtpDto)
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post("resend-otp-signup")
  async resendOtpSignup(resendOtpDto: ResendOtpDto) {
    try {
      return await this.authService.resendOtp(resendOtpDto.phoneNumber, "signup")
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post("resend-otp-login")
  async resendOtpLogin(resendOtpDto: ResendOtpDto) {
    try {
      return await this.authService.resendOtp(resendOtpDto.phoneNumber, "login")
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }

  // MSG91 widget verification flow: exchange MSG91 token for our JWT
  @Post("msg91/verify")
  async verifyMsg91(dto: VerifyMsg91Dto) {
    try {
      return await this.authService.verifyMsg91Token(dto.token, dto.name)
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST)
    }
  }
}
