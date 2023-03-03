import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { CartService } from "./cart.service";
import { CartDto } from "./dto/CartDto";

@ApiTags("Cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
  ) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get()
  async getCart(@Request() req) {
    return this.prismaService.cart.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        count: true,
        product: {
          select: {
            id: true,
            category: true,
            name: true,
            description: true,
            prices: {
              select: {
                id: true,
                value: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Post()
  async add(@Request() req, @Body() cartDto: CartDto) {
    return this.cartService.add(req.user.id, cartDto);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get("total")
  @ApiQuery({ name: "discountCode", required: false })
  async getTotal(@Request() req, @Query("discountCode") discountCode: string) {
    return this.cartService.getTotal(req.user.id, discountCode);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get("checkout")
  async checkout(@Request() req) {
    return this.cartService.checkout(req.user.id);
  }
}
