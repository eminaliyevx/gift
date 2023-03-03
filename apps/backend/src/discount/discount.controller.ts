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
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@ApiTags("Discount")
@ApiBearerAuth()
@Controller("discount")
export class DiscountController {
  constructor(private readonly prismaService: PrismaService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.prismaService.discount.create({
      data: createDiscountDto,
    });
  }

  @Public()
  @Get()
  async findAll() {
    return this.prismaService.discount.findMany();
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return discount;
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.prismaService.discount.update({
      data: updateDiscountDto,
      where: { id },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.prismaService.discount.delete({
      where: { id },
    });
  }
}
