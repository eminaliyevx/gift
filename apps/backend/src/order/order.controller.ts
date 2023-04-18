import { Controller, Get } from "@nestjs/common";
import { UseGuards } from "@nestjs/common/decorators";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { PrismaService } from "src/prisma/prisma.service";

@ApiTags("Order")
@ApiBearerAuth()
@Controller("order")
export class OrderController {
  constructor(private readonly prismaService: PrismaService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findMany() {
    return this.prismaService.order.findMany();
  }
}
