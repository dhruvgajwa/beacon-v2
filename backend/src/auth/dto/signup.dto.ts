import { IsNotEmpty, IsString, IsPhoneNumber } from "class-validator"

export class SignupDto {
  @IsString()
  name: string

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string
}
