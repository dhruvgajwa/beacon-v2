import { IsNotEmpty, IsString, Length } from "class-validator"

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string
}
