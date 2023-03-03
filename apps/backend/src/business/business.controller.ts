import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/decorators/public.decorator";
import { BusinessService } from "./business.service";
import { CreateBusinessDto } from "./dto/create-business.dto";

@ApiTags("Business")
@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Public()
  @HttpCode(200)
  @Post("register")
  async register(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.register(createBusinessDto);
  }
}
