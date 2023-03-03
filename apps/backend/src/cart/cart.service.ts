import { Injectable } from "@nestjs/common";
import { Cart, DiscountType, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import Stripe from "stripe";
import { CartItem, CreateCartDto } from "./dto/create-cart.dto";

const stripe = new Stripe(
  "sk_test_51MIdcaFDm83hh989c1RyCXyQrnWN6FbShtk95LerPXNqEwOXX8Ja8jt5QDlDQnI7dNj1Xmi335EXRHWCSV8EeFEo00et16hvsP",
  { apiVersion: "2022-11-15" },
);

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany<T extends Prisma.CartFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.CartFindManyArgs>,
  ) {
    return this.prismaService.cart.findMany(args);
  }

  async addToCart(userId: number, createCartDto: CreateCartDto) {
    const { items } = createCartDto;

    const cart = await this.findMany({ where: { userId } });

    const itemsToAdd: CartItem[] = [];
    const itemsToDelete: Cart[] = [];

    for (const item of cart) {
      const foundItem = items.find((i) => i.productId === item.productId);

      if (foundItem) {
        await this.prismaService.cart.update({
          data: {
            quantity: foundItem.quantity,
          },
          where: { userId_productId: { userId, productId: item.productId } },
        });
      } else {
        itemsToDelete.push(item);
      }
    }

    for (const item of items) {
      const foundItem = cart.find((i) => i.productId === item.productId);

      if (!foundItem) {
        itemsToAdd.push(item);
      }
    }

    await Promise.all([
      this.prismaService.cart.createMany({
        data: itemsToAdd.map((item) => ({ userId, ...item })),
      }),
      this.prismaService.cart.deleteMany({
        where: {
          userId,
          productId: {
            in: itemsToDelete.map(({ productId }) => productId),
          },
        },
      }),
    ]);

    return this.findMany({ where: { userId } });
  }

  async applyDiscount(total: number, discountCode: string) {
    const now = new Date();
    let discountTotal = total;

    const discount = discountCode
      ? await this.prismaService.discount.findUnique({
          where: { code: discountCode },
        })
      : null;

    if (!discount) {
      return total;
    }

    if (discount.remaining === 0) {
      return total;
    }

    if (
      !discount.endDate ||
      (discount.startDate < now && discount.endDate > now)
    ) {
      switch (discount.type) {
        case DiscountType.PERCENTAGE_TOTAL:
          discountTotal =
            discountTotal - (discountTotal * discount.value) / 100;
          break;
        case DiscountType.FIXED_TOTAL:
          discountTotal -= discount.value;
          break;
        default:
          break;
      }

      if (discount.limit) {
        await this.prismaService.discount.update({
          data: {
            remaining: {
              decrement: 1,
            },
          },
          where: { code: discountCode },
        });
      }
    }

    return discountTotal;
  }

  async findTotal(userId: number, discountCode?: string) {
    const now = new Date();

    const cart = await this.findMany({
      where: { userId },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            prices: {
              select: {
                id: true,
                value: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    let total = 0;

    cart.forEach((item) => {
      const price = item.product.prices.find(
        (_price) =>
          !_price.endDate || (_price.startDate < now && _price.endDate > now),
      );

      total += item.quantity * price.value;
    });

    const discountTotal = await this.applyDiscount(total, discountCode);

    return {
      total,
      discountTotal,
    };
  }

  async checkout(userId: number) {
    const now = new Date();

    const cart = await this.prismaService.cart.findMany({
      where: { userId },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            prices: {
              select: {
                id: true,
                value: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    cart.forEach((item) => {
      const price = item.product.prices.find(
        (_price) =>
          !_price.endDate || (_price.startDate < now && _price.endDate > now),
      );

      line_items.push({
        price_data: {
          currency: "azn",
          product_data: {
            name: item.product.name,
            description: item.product.description,
          },
          unit_amount: price.value * 100,
        },
        quantity: item.quantity,
      });
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "http://localhost:3000/order/success/{CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/order/error/{CHECKOUT_SESSION_ID}",
    });

    return session.url;
  }
}
