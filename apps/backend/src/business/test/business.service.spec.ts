import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { BusinessService } from "../business.service";

describe("BusinessService", () => {
  let businessService: BusinessService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BusinessService, PrismaService, ConfigService],
    }).compile();

    businessService = moduleRef.get<BusinessService>(BusinessService);
  });

  describe("register", () => {
    it("should register business", async () => {
      const user = await businessService.register({
        email: "business@test.com",
        phone: "557777777",
        password: "qwerty123",
        role: Role.BUSINESS,
        name: "NestJS",
      });

      expect(user.role).toBe(Role.BUSINESS);
    });
  });
});
