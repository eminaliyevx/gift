import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import { Gender, Role, Status, User } from "@prisma/client";
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";
import { JwtStrategy } from "../strategy/jwt.strategy";

describe("AuthService", () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: "JWT_SECRET",
          signOptions: { expiresIn: "7d" },
        }),
        MailModule,
      ],
      providers: [
        AuthService,
        UserService,
        JwtStrategy,
        PrismaService,
        ConfigService,
        MailService,
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    user = await prismaService.user.create({
      data: {
        id: 1331,
        email: "ealiyev12125@ada.edu.az",
        phone: "504206878",
        password: "jarvissa",
        role: Role.CUSTOMER,
        customer: {
          create: {
            firstName: "Emin",
            lastName: "Aliyev",
            birthDate: new Date("2002-06-23"),
            gender: Gender.MALE,
          },
        },
      },
    });
  });

  describe("validateUser", () => {
    it("should return user with undefined password given email and password are valid", async () => {
      prismaService.user.findUnique = jest.fn().mockReturnValue({
        email: "kibrahimli7825@ada.edu.az",
        password:
          "$2b$13$sP4JN2BTLSI7qZsPDWNDAOyBnXvfUbmTIkiYb4IHnAnTiPoLrl1Q2",
      });

      const result = await authService.validateUser(
        "kibrahimli7825@ada.edu.az",
        "kenan123",
      );

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it("should return null given email and password are invalid", async () => {
      prismaService.user.findUnique = jest.fn().mockReturnValue({
        email: "kibrahimli7825@ada.edu.az",
        password:
          "$2b$13$sP4JN2BTLSI7qZsPDWNDAOyBnXvfUbmTIkiYb4IHnAnTiPoLrl1Q2",
      });

      const result = await authService.validateUser(
        "kibrahimli7825@ada.edu.az",
        "kanan123",
      );

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return user and accessToken given a user payload", async () => {
      const user = {
        id: 7825,
        email: "kibrahimli7825@ada.edu.az",
        phone: "702496971",
        role: Role.CUSTOMER,
        confirmed: true,
        status: Status.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await authService.login(user);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });
  });

  describe("register", () => {
    it("should register user", async () => {
      const user = await authService.register({
        email: "auth@test.com",
        phone: "555555555",
        password: "qwerty123",
        role: Role.CUSTOMER,
      });

      expect(user.email).toBe("auth@test.com");
    });
  });

  describe("confirmEmail", () => {
    it("should confirm email given a valid access token", async () => {
      delete user.password;

      const accessToken = jwtService.sign(user);
      const result = await authService.confirmEmail(accessToken);

      expect(result.user.confirmed).toBe(true);
    });
  });
});
