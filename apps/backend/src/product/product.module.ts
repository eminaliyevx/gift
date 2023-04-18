import { Module } from "@nestjs/common";
import { S3Service } from "src/s3/s3.service";
import { ProductController } from "./product.controller";

@Module({
  controllers: [ProductController],
  providers: [S3Service],
})
export class ProductModule {}
