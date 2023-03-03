import { Prisma } from "@prisma/client";

const attributeWithCategories = Prisma.validator<Prisma.AttributeArgs>()({
  include: { categories: true },
});

export type AttributeWithCategories = Prisma.AttributeGetPayload<
  typeof attributeWithCategories
>;
