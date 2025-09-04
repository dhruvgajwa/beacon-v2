import { IsNotEmpty, IsString, IsIn, IsOptional } from "class-validator"

export class RegisterDeviceTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsNotEmpty()
  @IsString()
  @IsIn(["ios", "android"])
  platform: "ios" | "android"

  @IsOptional()
  @IsString()
  @IsIn(["expo", "generic", "sns"])
  tokenType?: "expo" | "generic" | "sns"
}
