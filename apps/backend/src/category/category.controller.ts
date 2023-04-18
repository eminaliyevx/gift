import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly prismaService: PrismaService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const { attributes, ...rest } = createCategoryDto;

    return this.prismaService.category.create({
      data: {
        ...rest,
        attributes: {
          connect: attributes?.map((id) => ({ id })),
        },
      },
      include: { attributes: true },
    });
  }

  @Get()
  async findMany() {
    return this.prismaService.category.findMany();
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: { attributes: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const { attributes, ...rest } = updateCategoryDto;
    const categoryAttributes = category.attributes.map(({ id }) => id);

    const connect = attributes
      ? attributes
          .filter((attribute) => !categoryAttributes.includes(attribute))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = attributes
      ? categoryAttributes
          .filter(
            (categoryAttribute) => !attributes.includes(categoryAttribute),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.prismaService.category.update({
      data: {
        ...rest,
        attributes: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { attributes: true },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.prismaService.category.delete({
      where: { id },
    });
  }
}
