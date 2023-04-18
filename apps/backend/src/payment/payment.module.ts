import { Module } from "@nestjs/common";
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";
import { PaymentService } from "./payment.service";

@Module({
  imports: [MailModule],
  providers: [PaymentService, MailService],
  exports: [PaymentService],
})
export class PaymentModule {}
