import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class ProductAttribute {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attributeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

class Price {
  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ isArray: true, type: ProductAttribute, required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttribute)
  attributes?: ProductAttribute[];

  @ApiProperty({ isArray: true, type: Price, required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Price)
  prices?: Price[];

  @ApiProperty({ isArray: true, type: "string", required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
