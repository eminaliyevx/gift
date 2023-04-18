import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { Gender, Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CustomerService } from "../customer.service";

describe("CustomerService", () => {
  let customerService: CustomerService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CustomerService, PrismaService, ConfigService],
    }).compile();

    customerService = moduleRef.get<CustomerService>(CustomerService);
  });

  describe("register", () => {
    it("should register customer", async () => {
      const user = await customerService.register({
        email: "customer@test.com",
        phone: "+994556666666",
        password: "qwerty123",
        role: Role.CUSTOMER,
        firstName: "Emin",
        lastName: "Aliyev",
        birthDate: "2002-06-23",
        gender: Gender.MALE,
      });

      expect(user.role).toEqual(Role.CUSTOMER);
    });
  });
});
