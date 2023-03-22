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
  UseInterceptors,
} from "@nestjs/common";
import { UploadedFiles } from "@nestjs/common/decorators";
import { FilesInterceptor } from "@nestjs/platform-express/multer/interceptors";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { unlinkSync } from "fs";
import { diskStorage } from "multer";
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
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("images", undefined, {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, "./product-images");
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
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const { attributes, prices, ...rest } = createProductDto;

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
            ? { data: images.map(({ filename, path }) => ({ filename, path })) }
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
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("images", undefined, {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, "./product-images");
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
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Patch(":id")
  async update(
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

    if (images.length > 0 && product.images.length > 0) {
      product.images.forEach(({ path }) => {
        unlinkSync(path);
      });
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
        images: {
          deleteMany: images ? {} : undefined,
          createMany: images
            ? {
                data: images.map(({ filename, path }) => ({ filename, path })),
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
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const product = await this.productService.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
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
