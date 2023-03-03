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
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("Product")
@ApiBearerAuth()
@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { attributes, prices, images, ...rest } = createProductDto;

    return this.productService.create({
      data: {
        ...rest,
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
        images: {
          createMany: images
            ? { data: images.map((url) => ({ url })) }
            : undefined,
        },
      },
    });
  }

  @Public()
  @Get()
  async findMany() {
    return this.productService.findMany();
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

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.findUnique({
      where: { id },
      include: {
        productAttributes: true,
        prices: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const { attributes, prices, images, ...rest } = updateProductDto;

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
        images: {
          deleteMany: images ? {} : undefined,
          createMany: images
            ? {
                data: images.map((url) => ({ url })),
              }
            : undefined,
        },
      },
      where: { id },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const product = await this.productService.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.productService.delete({
      where: { id },
    });
  }
}
