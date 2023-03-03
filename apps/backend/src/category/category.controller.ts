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
import { Public } from "src/decorators/public.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("Category")
@ApiBearerAuth()
@Controller("category")
export class CategoryController {
  constructor(private readonly prismaService: PrismaService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
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

  @Public()
  @Get()
  async findAll() {
    return this.prismaService.category.findMany();
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: { attributes: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
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

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
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
      include: { attributes: true },
    });
  }
}
