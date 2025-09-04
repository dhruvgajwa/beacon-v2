import { IsNotEmpty, IsPhoneNumber } from "class-validator"

export class SendConnectionRequestDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string
}
