import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "src/utils/bcrypt.util";
import { CreateBusinessDto } from "./dto/create-business.dto";

@Injectable()
export class BusinessService {
  constructor(private readonly prismaService: PrismaService) {}

  async register({ name, ...user }: CreateBusinessDto) {
    const password = hash(user.password);

    return this.prismaService.user.create({
      data: {
        ...user,
        password,
        role: Role.BUSINESS,
        business: { create: { name } },
      },
    });
  }
}
