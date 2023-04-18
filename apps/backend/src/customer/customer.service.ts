import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "src/utils/bcrypt.util";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async register({
    firstName,
    lastName,
    birthDate,
    gender,
    ...user
  }: CreateCustomerDto) {
    return this.prismaService.user.create({
      data: {
        ...user,
        password: hash(user.password),
        role: Role.CUSTOMER,
        customer: {
          create: {
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            gender,
          },
        },
      },
      select: {
        id: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
