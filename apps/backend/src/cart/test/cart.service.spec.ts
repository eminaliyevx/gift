import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { DiscountType, Gender, Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CartService } from "../cart.service";

describe("CartService", () => {
  let cartService: CartService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CartService, ConfigService, PrismaService],
    }).compile();

    cartService = moduleRef.get<CartService>(CartService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await prismaService.user.create({
      data: {
        id: 3131,
        email: "custo@test.com",
        phone: "553131313",
        password: "qwerty123",
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

    await prismaService.category.create({
      data: { id: "testCat", name: "testCategory" },
    });

    await prismaService.product.create({
      data: {
        id: "testProd1",
        name: "testProduct1",
        description: "testDescription1",
        categoryId: "testCat",
        prices: { createMany: { data: [{ value: 150 }] } },
      },
    });

    await prismaService.product.create({
      data: {
        id: "testProd2",
        name: "testProduct2",
        description: "testDescription2",
        categoryId: "testCat",
        prices: { createMany: { data: [{ value: 200 }] } },
      },
    });

    await prismaService.discount.create({
      data: {
        code: "TEST_PERCENTAGE_DISCOUNT_CODE",
        type: DiscountType.PERCENTAGE_TOTAL,
        value: 15,
        startDate: new Date(2023, 1, 1),
        endDate: new Date(2024, 1, 1),
      },
    });

    await prismaService.discount.create({
      data: {
        code: "TEST_FIXED_DISCOUNT_CODE",
        type: DiscountType.FIXED_TOTAL,
        value: 15,
        startDate: new Date(2023, 1, 1),
        endDate: new Date(2024, 1, 1),
      },
    });
  });

  describe("addToCart", () => {
    it("should add items to cart", async () => {
      const createCartDto = {
        items: [
          { productId: "testProd1", quantity: 2 },
          { productId: "testProd2", quantity: 1 },
        ],
      };

      const result = await cartService.addToCart(3131, createCartDto);

      expect(result.every((item) => item.userId === 3131)).toBe(true);
    });
  });

  describe("applyDiscount", () => {
    it("should return discount total if discount type is PERCENTAGE_TOTAL", async () => {
      const result = await cartService.applyDiscount(
        1300,
        "TEST_PERCENTAGE_DISCOUNT_CODE",
      );

      expect(result).toBe(1300 * 0.85);
    });

    it("should return discount total if discount type is FIXED_TOTAL", async () => {
      const result = await cartService.applyDiscount(
        60,
        "TEST_FIXED_DISCOUNT_CODE",
      );

      expect(result).toBe(45);
    });
  });

  describe("findTotal", () => {
    it("should return total without a discount code", async () => {
      const { total } = await cartService.findTotal(3131, undefined);

      expect(total).toBe(500);
    });

    it("should return total with a discount code", async () => {
      const { total, discountTotal } = await cartService.findTotal(
        3131,
        "TEST_PERCENTAGE_DISCOUNT_CODE",
      );

      expect(total).toBe(500);
      expect(discountTotal).toBe(500 * 0.85);
    });
  });

  describe("checkout", () => {
    it("should return the url of a Stripe session", async () => {
      const result = await cartService.checkout(3131);

      expect(result).toBeDefined();
    });
  });
});
