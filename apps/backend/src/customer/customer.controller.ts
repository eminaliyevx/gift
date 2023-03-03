import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth/auth.service";
import { Public } from "src/decorators/public.decorator";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@ApiTags("Customer")
@Controller("customer")
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @HttpCode(200)
  @Post("register")
  async register(@Body() createCustomerDto: CreateCustomerDto) {
    const user = await this.customerService.register(createCustomerDto);
    this.authService.sendConfirmationEmail(user);

    return user;
  }
}
