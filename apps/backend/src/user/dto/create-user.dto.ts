import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  IsEmail,
  IsIn,
  IsMobilePhone,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMobilePhone("az-AZ")
  phone: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 256,
  })
  @MinLength(8)
  @MaxLength(256)
  password: string;

  @ApiProperty({
    enum: Role,
  })
  @IsOptional()
  @IsIn(Object.values(Role))
  role: Role;
}
