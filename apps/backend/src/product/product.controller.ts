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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { unlinkSync } from "fs";
import { AccountWithoutPassword } from "local-types";
import { diskStorage } from "multer";
import { join } from "path";
import { GetUser } from "src/decorators/get-user.decorator";
import { Public } from "src/decorators/public.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { RoleGuard } from "src/guards/role.guard";
import {
  CreateProductDto,
  Price,
  ProductAttribute,
} from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("Product")
@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FilesInterceptor("images", undefined, {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, join(__dirname, "../../public/", "product-images"));
        },
        filename: (_req, file, callback) => {
          const filename = `${randomUUID()}.${file.originalname
            .split(".")
            .pop()}`;

          callback(null, filename);
        },
      }),
    }),
  )
  @Post()
  async create(
    @GetUser() user: AccountWithoutPassword,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const { name, description, categoryId, attributes, prices } =
      createProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    return this.productService.create({
      data: {
        name,
        description,
        categoryId,
        businessUserId: user.role === Role.BUSINESS ? user.id : null,
        productAttributes: {
          createMany: parsedAttributes
            ? {
                data: parsedAttributes,
              }
            : undefined,
        },
        prices: {
          createMany: parsedPrices
            ? {
                data: parsedPrices,
              }
            : undefined,
        },
        images: {
          createMany:
            images.length > 0
              ? {
                  data: images.map(({ filename, path }) => ({
                    filename,
                    path: path
                      .replace(/[\\/]+/g, "/")
                      .split("/")
                      .slice(-2)
                      .join("/"),
                  })),
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
        business: true,
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
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FilesInterceptor("images", undefined, {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, join(__dirname, "../../public/", "product-images"));
        },
        filename: (_req, file, callback) => {
          const filename = `${randomUUID()}.${file.originalname
            .split(".")
            .pop()}`;

          callback(null, filename);
        },
      }),
    }),
  )
  @Patch(":id")
  async update(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
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

    const { name, description, categoryId, attributes, prices } =
      updateProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    if (images.length > 0 && product.images.length > 0) {
      product.images.forEach(({ path }) => {
        unlinkSync(join(__dirname, "../../public/", path));
      });
    }

    return this.productService.update({
      data: {
        name,
        description,
        categoryId,
        productAttributes: {
          deleteMany: parsedAttributes ? {} : undefined,
          createMany: parsedAttributes
            ? {
                data: parsedAttributes,
              }
            : undefined,
        },
        prices: {
          deleteMany: parsedPrices ? {} : undefined,
          createMany: parsedPrices
            ? {
                data: parsedPrices,
              }
            : undefined,
        },
        images: {
          deleteMany: images.length > 0 ? {} : undefined,
          createMany:
            images.length > 0
              ? {
                  data: images.map(({ filename, path }) => ({
                    filename,
                    path: path
                      .replace(/[\\/]+/g, "/")
                      .split("/")
                      .slice(-2)
                      .join("/"),
                  })),
                }
              : undefined,
        },
      },
      where: { id },
      include: {
        category: true,
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
        unlinkSync(join(__dirname, "../../public/", path));
      });
    }

    return this.productService.delete({
      where: { id },
    });
  }
}
