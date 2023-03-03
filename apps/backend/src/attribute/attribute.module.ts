import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AttributeController } from "./attribute.controller";

@Module({
  controllers: [AttributeController],
  providers: [PrismaService],
})
export class AttributeModule {}
