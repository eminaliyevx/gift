import { Prisma } from "@prisma/client";

const userArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    customer: true,
    business: true,
    image: true,
  },
});

const productArgs = Prisma.validator<Prisma.ProductArgs>()({
  include: {
    category: true,
    productAttributes: true,
    prices: true,
    images: true,
    business: true,
  },
});

const cartArgs = Prisma.validator<Prisma.CartArgs>()({
  include: {
    product: {
      include: {
        prices: true,
        images: true,
      },
    },
  },
});

export type Account = Prisma.UserGetPayload<typeof userArgs>;
export type AccountWithoutPassword = Omit<Account, "password">;
export type Product = Prisma.ProductGetPayload<typeof productArgs>;
export type CartItem = Prisma.CartGetPayload<typeof cartArgs>;
