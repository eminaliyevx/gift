import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "src/utils/bcrypt.util";
import { CreateBusinessDto } from "./dto/create-business.dto";

@Injectable()
export class BusinessService {
  constructor(private readonly prismaService: PrismaService) {}

  async register({ name, ...user }: CreateBusinessDto) {
    return this.prismaService.user.create({
      data: {
        ...user,
        password: hash(user.password),
        role: Role.BUSINESS,
        business: { create: { name } },
      },
      select: {
        id: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
