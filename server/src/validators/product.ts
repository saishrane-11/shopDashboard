import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  sellingPrice: z.coerce.number().min(0, "Price must be 0 or more"),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  lowStockThreshold: z.coerce.number().int().min(0, "Low-stock threshold must be 0 or more"),
});

export const productUpdateSchema = productSchema.partial();
