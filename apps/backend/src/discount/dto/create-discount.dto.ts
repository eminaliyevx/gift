import { ApiProperty } from "@nestjs/swagger";
import { DiscountType } from "@prisma/client";
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  remaining?: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
