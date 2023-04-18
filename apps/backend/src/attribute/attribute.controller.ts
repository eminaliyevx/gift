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
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";

@ApiTags("Attribute")
@Controller("attribute")
export class AttributeController {
  constructor(private readonly prismaService: PrismaService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    const { categories, ...rest } = createAttributeDto;

    return this.prismaService.attribute.create({
      data: {
        ...rest,
        categories: {
          connect: categories?.map((id) => ({ id })),
        },
      },
      include: { categories: true },
    });
  }

  @Get()
  async findMany() {
    return this.prismaService.attribute.findMany();
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return attribute;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    const { categories, ...rest } = updateAttributeDto;
    const attributeCategories = attribute.categories.map(({ id }) => id);

    const connect = categories
      ? categories
          .filter((category) => !attributeCategories.includes(category))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = categories
      ? attributeCategories
          .filter(
            (attributeCategory) => !categories.includes(attributeCategory),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.prismaService.attribute.update({
      data: {
        ...rest,
        categories: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { categories: true },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return this.prismaService.attribute.delete({
      where: { id },
    });
  }
}
