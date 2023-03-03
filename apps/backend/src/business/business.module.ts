import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/prisma/prisma.service";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";

@Module({
  imports: [AuthModule],
  controllers: [BusinessController],
  providers: [PrismaService, BusinessService],
})
export class BusinessModule {}
