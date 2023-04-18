import { Module } from "@nestjs/common";
import { DiscountController } from "./discount.controller";

@Module({
  controllers: [DiscountController],
})
export class DiscountModule {}
