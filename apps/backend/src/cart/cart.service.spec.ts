import { Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { CartService } from "./cart.service";

describe("CartService", () => {
  let service: CartService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CartService, PrismaService],
    }).compile();

    service = moduleRef.get<CartService>(CartService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  it("should return the discounted total if discount type is PERCENTAGE_TOTAL", async () => {
    prisma.discount.findUnique = jest.fn().mockReturnValueOnce({
      id: "TEST_DISCOUNT",
      code: "TEST_DISCOUNT_CODE",
      type: "PERCENTAGE_TOTAL",
      value: 15,
      startDate: new Date(2023, 1, 1),
      endDate: new Date(2023, 4, 1),
    });

    const result = await service.applyDiscount(100, "TEST_DISCOUNT");

    expect(result).toBe(85);
  });

  it("should return the discounted total if discount type is FIXED_TOTAL", async () => {
    prisma.discount.findUnique = jest.fn().mockReturnValueOnce({
      id: "TEST_DISCOUNT",
      code: "TEST_DISCOUNT_CODE",
      type: "FIXED_TOTAL",
      value: 15,
      startDate: new Date(2023, 1, 1),
      endDate: new Date(2023, 4, 1),
    });

    const result = await service.applyDiscount(60, "TEST_DISCOUNT");

    expect(result).toBe(45);
  });

  it("should return the total without a discount code", async () => {
    prisma.cart.findMany = jest.fn().mockReturnValueOnce([
      {
        id: "cldqbajce0002offwxk29zhje",
        quantity: 1,
        product: {
          id: "cldq8ehai0004of2cu3e10h9h",
          prices: [
            {
              id: "cldq8ehai0005of2c35du4gfe",
              value: 15,
              startDate: "2023-02-04T17:30:49.482Z",
              endDate: null,
            },
          ],
        },
      },
    ]);

    const { total } = await service.findTotal(1, undefined);

    expect(total).toBe(15);
  });

  it("should return the total with a discount code", async () => {
    prisma.cart.findMany = jest.fn().mockReturnValueOnce([
      {
        id: "cldqbajce0002offwxk29zhje",
        quantity: 1,
        product: {
          id: "cldq8ehai0004of2cu3e10h9h",
          prices: [
            {
              id: "cldq8ehai0005of2c35du4gfe",
              value: 15,
              startDate: "2023-02-04T17:30:49.482Z",
              endDate: null,
            },
          ],
        },
      },
    ]);

    prisma.discount.findUnique = jest.fn().mockReturnValueOnce({
      id: "TEST_DISCOUNT",
      code: "TEST_DISCOUNT_CODE",
      type: "FIXED_TOTAL",
      value: 15,
      startDate: new Date(2023, 1, 1),
      endDate: new Date(2023, 4, 1),
    });

    const { total, discountTotal } = await service.findTotal(
      1,
      "TEST_DISCOUNT",
    );

    expect(total).toBe(15);
    expect(discountTotal).toBe(0);
  });

  it("should return the url of a Stripe session", async () => {
    prisma.cart.findMany = jest.fn().mockReturnValueOnce([
      {
        id: "cldqbajce0002offwxk29zhje",
        quantity: 1,
        product: {
          id: "cldq8ehai0004of2cu3e10h9h",
          name: "Origin",
          description: "Dan Brown's bestseller book",
          prices: [
            {
              id: "cldq8ehai0005of2c35du4gfe",
              value: 15,
              startDate: "2023-02-04T17:30:49.482Z",
              endDate: null,
            },
          ],
        },
      },
    ]);

    const result = await service.checkout(1);

    expect(result).toBeDefined();
  });
});
