import { User } from "@prisma/client";

export type UserWithoutPassword = Omit<User, "password">;
export type JwtUser = UserWithoutPassword & { iat: number; exp: number };
