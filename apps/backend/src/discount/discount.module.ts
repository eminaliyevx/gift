import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DiscountController } from "./discount.controller";

@Module({
  controllers: [DiscountController],
  providers: [PrismaService],
})
export class DiscountModule {}
