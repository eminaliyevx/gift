import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Account, AccountWithoutPassword } from "local-types";
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
    const user = await this.userService.findUnique({
      where: { email },
      include: { customer: true, business: true, image: true },
    });

    if (user && compare(password, user.password)) {
      delete user.password;

      return user;
    }

    return null;
  }

  async login(user: AccountWithoutPassword) {
    return {
      user,
      accessToken: this.jwtService.sign(user),
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  async sendConfirmationEmail(account: Account) {
    delete account.password;

    const accessToken = this.jwtService.sign(account);
    const hash = Buffer.from(accessToken, "utf8").toString("hex");

    return this.mailService.sendMail({
      from: "admin@eminaliyev.tech",
      to: account.email,
      subject: "Gift | Email confirmation",
      html: `<a href="http://138.68.125.221/confirm/${hash}">Click on the link to confirm your email address</a>`,
    });
  }

  async confirmEmail(hash: string) {
    const accessToken = Buffer.from(hash, "hex").toString("utf8");
    const account = this.jwtService.verify(accessToken) as Account;

    if (account) {
      const user = await this.userService.update({
        data: { confirmed: true },
        where: { email: account.email },
        include: {
          customer: true,
          business: true,
          image: true,
        },
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
