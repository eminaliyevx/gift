import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DiscountService {
  constructor(private readonly prismaService: PrismaService) {}

  async create<T extends Prisma.DiscountCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.DiscountCreateArgs>,
  ) {
    return this.prismaService.discount.create(args);
  }

  async findMany<T extends Prisma.DiscountFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.DiscountFindManyArgs>,
  ) {
    return this.prismaService.discount.findMany(args);
  }

  async findUnique<T extends Prisma.DiscountFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.DiscountFindUniqueArgs>,
  ) {
    return this.prismaService.discount.findUnique(args);
  }

  async update<T extends Prisma.DiscountUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.DiscountUpdateArgs>,
  ) {
    return this.prismaService.discount.update(args);
  }

  async delete<T extends Prisma.DiscountDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.DiscountDeleteArgs>,
  ) {
    return this.prismaService.discount.delete(args);
  }
}
