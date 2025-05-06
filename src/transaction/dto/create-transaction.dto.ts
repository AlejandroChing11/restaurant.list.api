import { ApiProperty } from "@nestjs/swagger";
import { IsString, Max, MaxLength, Min, MinLength } from "class-validator";




export class CreateTransactionDto {

  @ApiProperty({
    description: 'The Search term to filter Restaurants locations',
    type: String,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  searchTerm: string;

  @ApiProperty({
    description: 'The radius in meters to search for restaurants',
    type: Number,
    default: 1000,
  })
  @IsString()
  @Min(1)
  @Max(10)
  radius: number;



}
