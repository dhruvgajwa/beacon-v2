import { IsArray, ArrayNotEmpty, IsPhoneNumber } from "class-validator"

export class LookupContactsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsPhoneNumber("ZZ", { each: true })
  phoneNumbers: string[]
}
