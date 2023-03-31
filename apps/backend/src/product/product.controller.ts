import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { unlinkSync } from "fs";
import { AccountWithoutPassword } from "local-types";
import { GetUser } from "src/decorators/get-user.decorator";
import { Public } from "src/decorators/public.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("Product")
@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(RoleGuard)
  @Post()
  async create(
    @GetUser() user: AccountWithoutPassword,
    @Body() createProductDto: CreateProductDto,
  ) {
    const { attributes, prices, ...rest } = createProductDto;

    return this.productService.create({
      data: {
        ...rest,
        businessUserId: user.role === Role.BUSINESS ? user.id : null,
        productAttributes: {
          createMany: attributes
            ? {
                data: attributes,
              }
            : undefined,
        },
        prices: {
          createMany: prices
            ? {
                data: prices,
              }
            : undefined,
        },
      },
      include: {
        category: true,
        productAttributes: true,
        prices: true,
        images: true,
      },
    });
  }

  @Public()
  @Get()
  async findMany() {
    return this.productService.findMany({
      include: {
        category: true,
        productAttributes: true,
        prices: true,
        images: true,
      },
    });
  }

  @Public()
  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const product = await this.productService.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(RoleGuard)
  @Patch(":id")
  async update(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (user.role === Role.BUSINESS && product.businessUserId !== user.id) {
      throw new ForbiddenException();
    }

    const { attributes, prices, ...rest } = updateProductDto;

    return this.productService.update({
      data: {
        ...rest,
        productAttributes: {
          deleteMany: attributes ? {} : undefined,
          createMany: attributes
            ? {
                data: attributes,
              }
            : undefined,
        },
        prices: {
          deleteMany: prices ? {} : undefined,
          createMany: prices
            ? {
                data: prices,
              }
            : undefined,
        },
      },
      where: { id },
      include: {
        productAttributes: true,
        prices: true,
        images: true,
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
  ) {
    const product = await this.productService.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (user.role === Role.BUSINESS && product.businessUserId !== user.id) {
      throw new ForbiddenException();
    }

    if (product.images.length > 0) {
      product.images.forEach(({ path }) => {
        unlinkSync(path);
      });
    }

    return this.productService.delete({
      where: { id },
    });
  }
}
