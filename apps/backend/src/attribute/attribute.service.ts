import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AttributeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create<T extends Prisma.AttributeCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.AttributeCreateArgs>,
  ) {
    return this.prismaService.attribute.create(args);
  }

  async findMany<T extends Prisma.AttributeFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.AttributeFindManyArgs>,
  ) {
    return this.prismaService.attribute.findMany(args);
  }

  async findUnique<T extends Prisma.AttributeFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.AttributeFindUniqueArgs>,
  ) {
    return this.prismaService.attribute.findUnique(args);
  }

  async update<T extends Prisma.AttributeUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.AttributeUpdateArgs>,
  ) {
    return this.prismaService.attribute.update(args);
  }

  async delete<T extends Prisma.AttributeDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.AttributeDeleteArgs>,
  ) {
    return this.prismaService.attribute.delete(args);
  }
}
