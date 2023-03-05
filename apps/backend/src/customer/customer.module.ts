import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/prisma/prisma.service";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";

@Module({
  imports: [AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService],
})
export class CustomerModule {}
