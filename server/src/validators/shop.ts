import { z } from "zod";

export const shopUpdateSchema = z.object({
  shopName: z.string().trim().min(1, "Shop name is required").optional(),
  ownerName: z.string().trim().min(1, "Owner name is required").optional(),
  phone: z.string().trim().min(8, "Phone number is required").optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});
