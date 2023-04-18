import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";

export class CartItem {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({ isArray: true, type: CartItem, required: true })
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  items: CartItem[];
}
