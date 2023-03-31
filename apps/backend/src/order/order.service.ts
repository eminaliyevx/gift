import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async create<T extends Prisma.OrderCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderCreateArgs>,
  ) {
    return this.prismaService.order.create(args);
  }

  async findMany<T extends Prisma.OrderFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.OrderFindManyArgs>,
  ) {
    return this.prismaService.order.findMany(args);
  }

  async findUnique<T extends Prisma.OrderFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderFindUniqueArgs>,
  ) {
    return this.prismaService.order.findUnique(args);
  }

  async update<T extends Prisma.OrderUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderUpdateArgs>,
  ) {
    return this.prismaService.order.update(args);
  }

  async delete<T extends Prisma.OrderDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderDeleteArgs>,
  ) {
    return this.prismaService.order.delete(args);
  }
}
