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
import { RoleGuard } from "src/guards/role.guard";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@ApiTags("Discount")
@ApiBearerAuth()
@Controller("discount")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create({
      data: createDiscountDto,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Get()
  async findAll() {
    return this.discountService.findMany();
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const discount = await this.discountService.findUnique({
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
    const discount = await this.discountService.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.discountService.update({
      data: updateDiscountDto,
      where: { id },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const discount = await this.discountService.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.discountService.delete({
      where: { id },
    });
  }
}
