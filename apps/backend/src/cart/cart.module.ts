import { Module } from "@nestjs/common";
import { MailService } from "src/mail/mail.service";
import { PaymentModule } from "src/payment/payment.module";
import { PaymentService } from "src/payment/payment.service";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [PaymentModule],
  controllers: [CartController],
  providers: [CartService, PaymentService, MailService],
})
export class CartModule {}
