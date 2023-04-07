import { PutObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { Account, AccountWithoutPassword } from "local-types";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma/prisma.service";
import { S3Service } from "src/s3/s3.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { UserService } from "src/user/user.service";
import { compare } from "src/utils/bcrypt.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
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
    account.confirmed = true;

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
        data: { confirmed: account.confirmed },
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

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const userImage = await this.prismaService.userImage.findUnique({
      where: { userId },
    });

    const key =
      image &&
      `user-images/${userId}-${randomUUID()}.${image.originalname
        .split(".")
        .pop()}`;
    const url =
      image && `${this.configService.get<string>("SPACES_CDN_ENDPOINT")}${key}`;

    try {
      image &&
        (await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        ));
    } catch {
      throw new BadRequestException();
    }

    return this.prismaService.user.update({
      data: {
        ...updateUserDto,
        image: image
          ? {
              delete: !!userImage,
              create: {
                key,
                url,
              },
            }
          : undefined,
      },
      where: { id: userId },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });
  }
}
