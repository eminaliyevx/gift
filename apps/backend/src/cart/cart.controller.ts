import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AccountWithoutPassword } from "local-types";
import { GetUser } from "src/decorators/get-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { CartService } from "./cart.service";
import { CheckoutDto } from "./dto/checkout.dto";
import { CreateCartDto } from "./dto/create-cart.dto";

@ApiTags("Cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async getCart(@GetUser() user: AccountWithoutPassword) {
    return this.cartService.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            prices: true,
            images: true,
          },
        },
      },
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  async addToCart(
    @GetUser() user: AccountWithoutPassword,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addToCart(user.id, createCartDto);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get("total")
  @ApiQuery({ name: "discountCode", required: false })
  async getCartTotal(
    @GetUser() user: AccountWithoutPassword,
    @Query("discountCode") discountCode?: string,
  ) {
    const { total, discountTotal } = await this.cartService.findTotal(
      user.id,
      discountCode,
    );

    return { total, discountTotal };
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post("checkout")
  async checkout(
    @GetUser() user: AccountWithoutPassword,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.cartService.checkout(user, checkoutDto);
  }
}
