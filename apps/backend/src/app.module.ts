import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as Joi from "joi";
import { join } from "path";
import { AttributeModule } from "./attribute/attribute.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessModule } from "./business/business.module";
import { CartModule } from "./cart/cart.module";
import { CategoryModule } from "./category/category.module";
import { CustomerModule } from "./customer/customer.module";
import { DiscountModule } from "./discount/discount.module";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PrismModule } from "./prisma/prisma.module";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
    PrismModule,
    AuthModule,
    UserModule,
    CustomerModule,
    BusinessModule,
    CategoryModule,
    AttributeModule,
    ProductModule,
    CartModule,
    DiscountModule,
    MailerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../..", "frontend", "dist"),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
