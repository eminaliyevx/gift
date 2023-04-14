import type { Price, Product } from "@prisma/client";

export const findPrice = (product: Product & { prices: Price[] }) => {
  const now = new Date();
  const price = product.prices.find(
    (_price) =>
      !_price.endDate ||
      (new Date(_price.startDate) < now && new Date(_price.endDate) > now)
  );

  return price?.value || NaN;
};
