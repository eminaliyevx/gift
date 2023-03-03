import { Injectable } from "@nestjs/common";
import { DiscountType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import Stripe from "stripe";
import { CartDto } from "./dto/CartDto";

const stripe = new Stripe(
  "sk_test_51MIdcaFDm83hh989c1RyCXyQrnWN6FbShtk95LerPXNqEwOXX8Ja8jt5QDlDQnI7dNj1Xmi335EXRHWCSV8EeFEo00et16hvsP",
  { apiVersion: "2022-11-15" },
);

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: number, cartDto: CartDto) {
    const { products } = cartDto;

    await this.prisma.cart.deleteMany({
      where: { userId },
    });

    return this.prisma.cart.createMany({
      data: products.map(({ productId, count }) => ({
        userId,
        productId,
        count,
      })),
    });
  }

  async applyDiscount(total: number, discountCode: string) {
    const now = new Date();
    let discountTotal = total;

    const discount = discountCode
      ? await this.prisma.discount.findUnique({
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
        await this.prisma.discount.update({
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

  async getTotal(userId: number, discountCode?: string) {
    const now = new Date();

    const cart = await this.prisma.cart.findMany({
      where: { userId },
      orderBy: [{ count: "desc" }],
      select: {
        id: true,
        count: true,
        product: {
          select: {
            id: true,
            category: true,
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

    let total = 0;

    cart.forEach((item) => {
      const price = item.product.prices.find(
        (_price) =>
          !_price.endDate || (_price.startDate < now && _price.endDate > now),
      );

      total += item.count * price.value;
    });

    const discountTotal = await this.applyDiscount(total, discountCode);

    return {
      cart,
      total,
      discountTotal,
    };
  }

  async checkout(userId: number) {
    const now = new Date();

    const cart = await this.prisma.cart.findMany({
      where: { userId },
      select: {
        id: true,
        count: true,
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
        quantity: item.count,
      });
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url:
        "https://sdp2022-app.vercel.app/order/success/{CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://sdp2022-app.vercel.app/order/error/{CHECKOUT_SESSION_ID}",
    });

    return session.url;
  }
}
