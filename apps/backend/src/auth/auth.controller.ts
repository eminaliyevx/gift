import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AccountWithoutPassword } from "local-types";
import { GetUser } from "src/decorators/get-user.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { LocalAuthGuard } from "src/guards/local-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(200)
  @ApiBody({ type: LoginUserDto })
  async login(@GetUser() user: AccountWithoutPassword) {
    return this.authService.login(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("account")
  async getAccount(@GetUser() user: AccountWithoutPassword) {
    return this.authService.getAccount(user.id);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @Patch("account")
  async update(
    @GetUser() user: AccountWithoutPassword,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.authService.updateAccount(
      user.id,
      { email: updateUserDto.email, phone: updateUserDto.phone },
      image,
    );
  }

  @Get("confirm")
  async confirmEmail(@Query("hash") hash: string) {
    return this.authService.confirmEmail(hash);
  }
}
