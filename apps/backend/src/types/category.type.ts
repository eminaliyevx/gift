import { Prisma } from "@prisma/client";

const categoryWithAttributes = Prisma.validator<Prisma.CategoryArgs>()({
  include: { attributes: true },
});

export type CategoryWithAttributes = Prisma.CategoryGetPayload<
  typeof categoryWithAttributes
>;
