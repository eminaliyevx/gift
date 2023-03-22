import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
  "password",
] as const) {
  @ApiProperty({ type: "file", format: "binary", required: false })
  @IsOptional()
  image?: Express.Multer.File;
}
