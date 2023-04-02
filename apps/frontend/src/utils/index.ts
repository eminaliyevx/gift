import type { Price, Product } from "@prisma/client";
import { createContext, useContext } from "react";

export const createCtx = <T extends {} | null>() => {
  const ctx = createContext<T | undefined>(undefined);

  const useCtx = () => {
    const c = useContext(ctx);

    if (c === undefined)
      throw new Error("useCtx must be inside a Provider with a value");

    return c;
  };

  return [useCtx, ctx.Provider] as const;
};

export const findPrice = (product: Product & { prices: Price[] }) => {
  const now = new Date();
  const price = product.prices.find(
    (_price) =>
      !_price.endDate ||
      (new Date(_price.startDate) < now && new Date(_price.endDate) > now)
  );

  return price?.value || NaN;
};
