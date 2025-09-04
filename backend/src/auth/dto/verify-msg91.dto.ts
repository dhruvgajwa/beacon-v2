import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class VerifyMsg91Dto {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsOptional()
  @IsString()
  name?: string
}
