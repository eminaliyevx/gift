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
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@ApiTags("Product")
@ApiBearerAuth()
@Controller("product")
export class ProductController {
  constructor(private readonly prismaService: PrismaService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { attributes, prices, ...rest } = createProductDto;

    return this.prismaService.product.create({
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
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        productAttributes: {
          select: {
            id: true,
            value: true,
            attribute: true,
          },
        },
        prices: {
          select: {
            id: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }

  @Public()
  @Get()
  async findAll() {
    return this.prismaService.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        prices: {
          select: {
            id: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        productAttributes: {
          select: {
            id: true,
            value: true,
            attribute: true,
          },
        },
        prices: {
          select: {
            id: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
      },
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
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        productAttributes: true,
        prices: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const { attributes, prices, ...rest } = updateProductDto;

    return this.prismaService.product.update({
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
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        productAttributes: {
          select: {
            id: true,
            value: true,
            attribute: true,
          },
        },
        prices: {
          select: {
            id: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.prismaService.product.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        productAttributes: {
          select: {
            id: true,
            value: true,
            attribute: true,
          },
        },
        prices: {
          select: {
            id: true,
            value: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }
}
