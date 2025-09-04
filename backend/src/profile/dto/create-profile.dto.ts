import { IsNotEmpty, IsString, IsArray, IsOptional, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateProfileDto {
  @ApiProperty({ description: "User name", example: "John Doe" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: "User bio", example: "Software developer from New York", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @ApiProperty({
    description: "User interests",
    example: ["hiking", "photography", "coding"],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  interests?: string[]
}
