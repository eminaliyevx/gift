import { describe, expect, it } from "vitest";
import { findPrice } from "../utils";

describe("utils", () => {
  it("should find price given a product", () => {
    const result = findPrice({
      id: "clg744ow5000blh0iaw2kgwa4",
      name: "Amazon Essentials",
      description: "Men's Easy to Read Strap Watch",
      createdAt: new Date("2023-04-07T22:22:43.972Z"),
      updatedAt: new Date("2023-04-07T22:22:43.972Z"),
      categoryId: "clg74085m0004lh0iw2aip5ba",
      businessUserId: null,
      prices: [
        {
          id: "clg744ow5000clh0io7mwm6em",
          productId: "clg744ow5000blh0iaw2kgwa4",
          value: 30,
          startDate: new Date("2023-04-07T22:22:43.972Z"),
          endDate: null,
          createdAt: new Date("2023-04-07T22:22:43.972Z"),
          updatedAt: new Date("2023-04-07T22:22:43.972Z"),
        },
      ],
    });

    expect(result).toBe(30);
  });
});
