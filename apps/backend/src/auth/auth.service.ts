import { PutObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { AccountWithoutPassword } from "local-types";
import { MailService } from "src/mail/mail.service";
import { S3Service } from "src/s3/s3.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { UserService } from "src/user/user.service";
import { compare } from "src/utils/bcrypt.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUnique({
      where: { email },
      include: { customer: true, business: true, image: true },
    });

    if (user && compare(password, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return rest;
    }

    return null;
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  async login(user: AccountWithoutPassword) {
    return {
      accessToken: this.jwtService.sign(user),
    };
  }

  async getAccount(userId: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = await this.userService.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });

    return rest;
  }

  async updateAccount(
    userId: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const _user = await this.userService.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    const key =
      image &&
      `user-images/${userId}-${randomUUID()}.${image.originalname
        .split(".")
        .pop()}`;
    const url =
      image && `${this.configService.get<string>("SPACES_CDN_ENDPOINT")}${key}`;

    try {
      if (image) {
        await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        );
      }

      return this.userService.update({
        data: {
          email: updateUserDto.email,
          phone: updateUserDto.phone,
          image: image
            ? {
                delete: !!_user.image,
                create: { key, url },
              }
            : undefined,
        },
        where: { id: userId },
        select: {
          id: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      throw new BadRequestException();
    }
  }

  async sendConfirmationEmail(userId: number) {
    const account = await this.getAccount(userId);

    account.confirmed = true;

    const accessToken = this.jwtService.sign(account);
    const hash = Buffer.from(accessToken, "utf8").toString("hex");

    return this.mailService.sendMail({
      from: "admin@eminaliyev.tech",
      to: account.email,
      subject: "Gift | Email confirmation",
      html: `<a href="http://138.68.125.221:3000/confirm/${hash}">Click on the link to confirm your email address</a>`,
    });
  }

  async confirmEmail(hash: string) {
    const accessToken = Buffer.from(hash, "hex").toString("utf8");

    try {
      const account = await this.jwtService.verifyAsync<AccountWithoutPassword>(
        accessToken,
      );

      if (account) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = await this.userService.update({
          data: { confirmed: account.confirmed },
          where: { id: account.id },
          include: {
            customer: true,
            business: true,
            image: true,
          },
        });

        return {
          accessToken: this.jwtService.sign(rest),
        };
      } else {
        throw new BadRequestException();
      }
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
