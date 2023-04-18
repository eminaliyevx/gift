import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AttributeModule } from "./attribute/attribute.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessModule } from "./business/business.module";
import { CartModule } from "./cart/cart.module";
import { CategoryModule } from "./category/category.module";
import { CustomerModule } from "./customer/customer.module";
import { DiscountModule } from "./discount/discount.module";
import { HealthModule } from "./health/health.module";
import { OrderModule } from "./order/order.module";
import { PaymentModule } from "./payment/payment.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CustomerModule,
    BusinessModule,
    CategoryModule,
    AttributeModule,
    DiscountModule,
    ProductModule,
    OrderModule,
    CartModule,
    MailerModule,
    PaymentModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../..", "frontend", "dist"),
    }),
  ],
})
export class AppModule {}
