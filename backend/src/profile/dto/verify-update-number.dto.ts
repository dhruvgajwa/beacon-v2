import { IsNotEmpty, IsString, Length } from "class-validator"

export class VerifyUpdateNumberDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string
}
