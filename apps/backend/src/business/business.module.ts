import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";

@Module({
  controllers: [BusinessController],
  providers: [PrismaService, BusinessService],
})
export class BusinessModule {}
