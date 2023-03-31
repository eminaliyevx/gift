import { Controller, Get } from "@nestjs/common";
import { UseGuards } from "@nestjs/common/decorators";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { OrderService } from "./order.service";

@ApiTags("Order")
@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Get()
  async findMany() {
    return this.orderService.findMany();
  }
}
