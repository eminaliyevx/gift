import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateBusinessDto } from "./create-business.dto";

export class UpdateBusinessDto extends OmitType(
  PartialType(CreateBusinessDto),
  ["password"] as const,
) {}
