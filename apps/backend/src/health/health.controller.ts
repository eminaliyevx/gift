import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  async health() {
    return "health";
  }
}
