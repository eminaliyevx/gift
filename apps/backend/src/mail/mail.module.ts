import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: "smtp.titan.email",
        port: 465,
        auth: {
          user: "admin@eminaliyev.tech",
          pass: "fm6S7S@9wF*6ck%3",
        },
      },
      defaults: {
        from: "admin@eminaliyev.tech",
      },
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
