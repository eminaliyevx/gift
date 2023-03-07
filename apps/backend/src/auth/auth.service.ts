import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { JwtUser, UserWithoutPassword } from "local-types";
import { MailService } from "src/mail/mail.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { compare } from "src/utils/bcrypt.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUnique({ where: { email } });

    if (user && compare(password, user.password)) {
      delete user.password;

      return user;
    }

    return null;
  }

  async login(user: UserWithoutPassword) {
    return {
      user,
      accessToken: this.jwtService.sign(user),
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  async sendConfirmationEmail(user: User) {
    delete user.password;

    const accessToken = this.jwtService.sign(user);

    return this.mailService.sendMail({
      from: "admin@eminaliyev.tech",
      to: user.email,
      subject: "Gift | Email confirmation",
      text: accessToken,
    });
  }

  async confirmEmail(accessToken: string) {
    const jwtUser = this.jwtService.verify(accessToken) as JwtUser;

    if (jwtUser) {
      const user = await this.userService.update({
        data: { confirmed: true },
        where: { email: jwtUser.email },
      });

      delete user.password;

      return {
        user,
        accessToken: this.jwtService.sign(user),
      };
    } else {
      throw new BadRequestException();
    }
  }
}
