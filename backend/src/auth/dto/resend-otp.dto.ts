import { IsNotEmpty, IsPhoneNumber } from "class-validator"

export class ResendOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string
}
