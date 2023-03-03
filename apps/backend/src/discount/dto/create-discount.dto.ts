import { ApiProperty } from "@nestjs/swagger";
import { DiscountType } from "@prisma/client";
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateDiscountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    enum: DiscountType,
  })
  @IsIn(Object.values(DiscountType))
  type: DiscountType;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  remaining: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}
