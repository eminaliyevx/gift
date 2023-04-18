import { IsNumber } from "class-validator";
import { CheckoutDto } from "./checkout.dto";

export class PaymentDto extends CheckoutDto {
  @IsNumber()
  amount: number;
}
