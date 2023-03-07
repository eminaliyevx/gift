import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional } from "class-validator";

export class CreateAttributeDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ isArray: true, type: "string", required: false })
  @IsOptional()
  @IsArray()
  categories?: string[];
}
