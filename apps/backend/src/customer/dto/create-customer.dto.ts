import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "@prisma/client";
import { IsIn, IsISO8601, IsNotEmpty } from "class-validator";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export class CreateCustomerDto extends CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsISO8601()
  birthDate: string;

  @ApiProperty({
    enum: Gender,
  })
  @IsIn(Object.values(Gender))
  gender: Gender;
}
