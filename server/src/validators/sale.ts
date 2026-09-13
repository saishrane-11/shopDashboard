import { z } from "zod";

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
      }),
    )
    .min(1, "Add at least one product"),
});
