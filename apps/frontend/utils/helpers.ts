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
