export function stockStatus(stockQuantity: number, lowStockThreshold: number) {
  if (stockQuantity <= 0) return "OUT_OF_STOCK" as const;
  if (stockQuantity <= lowStockThreshold) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

export function stockStatusLabel(status: ReturnType<typeof stockStatus>) {
  if (status === "OUT_OF_STOCK") return "Out of Stock";
  if (status === "LOW_STOCK") return "Low Stock";
  return "In Stock";
}
