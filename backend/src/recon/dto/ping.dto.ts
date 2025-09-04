import { IsNotEmpty, IsString } from "class-validator"

export class PingDto {
  @IsNotEmpty()
  @IsString()
  userId: string
}
