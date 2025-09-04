import { IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from "class-validator"

export class UpdateLocationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: [number, number] // [lon, lat]

  // optional accuracy in meters to help server-side filtering (not required)
  @IsNumber()
  accuracy?: number
}
