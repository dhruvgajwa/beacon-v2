import { IsNotEmpty, IsString, Length } from "class-validator"

export class VerifyDeleteProfileDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string
}
