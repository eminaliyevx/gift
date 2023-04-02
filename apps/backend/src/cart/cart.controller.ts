import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AccountWithoutPassword } from "local-types";
import { GetUser } from "src/decorators/get-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { CartService } from "./cart.service";
import { CheckoutDto, CreateCartDto } from "./dto/cart.dto";

@ApiTags("Cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get()
  async findCart(@GetUser() user: AccountWithoutPassword) {
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
  @UseGuards(RoleGuard)
  @Post()
  async addToCart(
    @GetUser() user: AccountWithoutPassword,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addToCart(user.id, createCartDto);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get("total")
  @ApiQuery({ name: "discountCode", required: false })
  async findTotal(
    @GetUser() user: AccountWithoutPassword,
    @Query("discountCode") discountCode: string,
  ) {
    const { total, discountTotal } = await this.cartService.findTotal(
      user.id,
      discountCode,
    );

    return { total, discountTotal };
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Post("checkout")
  async checkout(
    @GetUser() user: AccountWithoutPassword,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.cartService.checkout(user.id, checkoutDto);
  }
}
