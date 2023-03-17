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
    const password = hash(user.password);

    return this.prismaService.user.create({
      data: {
        ...user,
        password,
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
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });
  }
}
