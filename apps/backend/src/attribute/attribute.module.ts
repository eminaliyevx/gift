import { Module } from "@nestjs/common";
import { AttributeController } from "./attribute.controller";

@Module({
  controllers: [AttributeController],
})
export class AttributeModule {}
