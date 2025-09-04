import { IsNotEmpty, IsNumber, IsArray, Min, Max, ArrayMaxSize, ArrayMinSize } from "class-validator"
import { Type } from "class-transformer"

export class ReconDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: number[]

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  distance: number
}
