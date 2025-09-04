import { IsNotEmpty, IsPhoneNumber } from "class-validator"

export class UpdateNumberDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  newPhoneNumber: string
}
