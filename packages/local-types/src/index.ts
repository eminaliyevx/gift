import { Prisma } from "@prisma/client";

const userArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    customer: true,
    business: true,
    image: true,
  },
});

export type Account = Prisma.UserGetPayload<typeof userArgs>;
export type AccountWithoutPassword = Omit<Account, "password">;
