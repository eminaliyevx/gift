import { Prisma } from "@prisma/client";

const productWithAttributes = Prisma.validator<Prisma.ProductArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    category: true,
    productAttributes: {
      select: {
        value: true,
        attribute: true,
      },
    },
  },
});

export type ProductWithAttributes = Prisma.ProductGetPayload<
  typeof productWithAttributes
>;
