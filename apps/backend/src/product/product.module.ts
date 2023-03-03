import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ProductController } from "./product.controller";

@Module({
  controllers: [ProductController],
  providers: [PrismaService],
})
export class ProductModule {}
