import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";

@Module({
  imports: [AuthModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
