import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DiscountController } from "./discount.controller";
import { DiscountService } from "./discount.service";

@Module({
  controllers: [DiscountController],
  providers: [PrismaService, DiscountService],
})
export class DiscountModule {}
