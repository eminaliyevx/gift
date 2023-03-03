import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role, User } from "@prisma/client";
import { GetUser } from "src/decorators/get-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { CartService } from "./cart.service";
import { CreateCartDto } from "./dto/create-cart.dto";

@ApiTags("Cart")
@ApiBearerAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get()
  async findCart(@GetUser() user: User) {
    return this.cartService.findMany({
      where: { userId: user.id },
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Post()
  async addToCart(@GetUser() user: User, @Body() createCartDto: CreateCartDto) {
    return this.cartService.addToCart(user.id, createCartDto);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get("total")
  @ApiQuery({ name: "discountCode", required: false })
  async findTotal(
    @GetUser() user: User,
    @Query("discountCode") discountCode: string,
  ) {
    return this.cartService.findTotal(user.id, discountCode);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(RoleGuard)
  @Get("checkout")
  async checkout(@GetUser() user: User) {
    return this.cartService.checkout(user.id);
  }
}
