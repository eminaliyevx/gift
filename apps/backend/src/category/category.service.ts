import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create<T extends Prisma.CategoryCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryCreateArgs>,
  ) {
    return this.prismaService.category.create(args);
  }

  async findMany<T extends Prisma.CategoryFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.CategoryFindManyArgs>,
  ) {
    return this.prismaService.category.findMany(args);
  }

  async findUnique<T extends Prisma.CategoryFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryFindUniqueArgs>,
  ) {
    return this.prismaService.category.findUnique(args);
  }

  async update<T extends Prisma.CategoryUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryUpdateArgs>,
  ) {
    return this.prismaService.category.update(args);
  }

  async delete<T extends Prisma.CategoryDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryDeleteArgs>,
  ) {
    return this.prismaService.category.delete(args);
  }
}
