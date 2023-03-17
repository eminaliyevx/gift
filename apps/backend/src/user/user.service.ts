import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "src/utils/bcrypt.util";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const password = hash(createUserDto.password);

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password,
      },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });
  }

  async findUnique<T extends Prisma.UserFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>,
  ) {
    return this.prismaService.user.findUnique(args);
  }

  async update<T extends Prisma.UserUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserUpdateArgs>,
  ) {
    return this.prismaService.user.update(args);
  }
}
