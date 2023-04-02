import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class ProductAttribute {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attributeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class Price {
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

  @ApiProperty()
  @IsOptional()
  @IsJSON()
  attributes?: string;

  @ApiProperty()
  @IsOptional()
  @IsJSON()
  prices?: string;

  @ApiProperty({
    isArray: true,
    type: "file",
    format: "binary",
    required: false,
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
