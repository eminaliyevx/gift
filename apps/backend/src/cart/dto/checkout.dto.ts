import { ApiProperty } from "@nestjs/swagger";
import {
  IsCreditCard,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CheckoutDto {
  @ApiProperty()
  @IsCreditCard()
  number: string;

  @ApiProperty()
  @IsNumber()
  exp_month: number;

  @ApiProperty()
  @IsNumber()
  exp_year: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cvc: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  discountCode?: string;
}
