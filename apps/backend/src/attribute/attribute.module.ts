import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AttributeController } from "./attribute.controller";
import { AttributeService } from "./attribute.service";

@Module({
  controllers: [AttributeController],
  providers: [AttributeService, PrismaService],
})
export class AttributeModule {}
