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
import { AttributeService } from "./attribute.service";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";

@ApiTags("Attribute")
@ApiBearerAuth()
@Controller("attribute")
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    const { categories, ...rest } = createAttributeDto;

    return this.attributeService.create({
      data: {
        ...rest,
        categories: {
          connect: categories?.map((id) => ({ id })),
        },
      },
      include: { categories: true },
    });
  }

  @Public()
  @Get()
  async findMany() {
    return this.attributeService.findMany();
  }

  @Public()
  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const attribute = await this.attributeService.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return attribute;
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    const attribute = await this.attributeService.findUnique({
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

    return this.attributeService.update({
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

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const attribute = await this.attributeService.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return this.attributeService.delete({
      where: { id },
      include: { categories: true },
    });
  }
}
