import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Role, User } from "@prisma/client";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { AccountWithoutPassword } from "local-types";
import { GetUser } from "src/decorators/get-user.decorator";
import { Public } from "src/decorators/public.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { LocalAuthGuard } from "src/guards/local-auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

class LoginApiBody {
  @ApiProperty({
    minLength: 6,
    maxLength: 256,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 256,
  })
  @MinLength(8)
  @MaxLength(256)
  password: string;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(200)
  @ApiBody({ type: LoginApiBody })
  async login(@GetUser() user: AccountWithoutPassword) {
    return this.authService.login(user);
  }

  @ApiBearerAuth()
  @Get("account")
  async getAccount(@GetUser() user: User) {
    if (user) {
      const _user = await this.userService.findUnique({
        where: { id: user.id },
        include: {
          customer: true,
          business: true,
          image: true,
        },
      });

      delete _user.password;

      return _user;
    } else {
      return user;
    }
  }

  @Public()
  @Get("confirm")
  async confirmEmail(@Query("hash") hash: string) {
    return this.authService.confirmEmail(hash);
  }
}
