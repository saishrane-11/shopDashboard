import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { toNumber } from "../utils/money.js";
import { stockStatus } from "../utils/stock.js";

function mapProduct(product: {
  id: string;
  name: string;
  sellingPrice: { toString(): string };
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const status = stockStatus(product.stockQuantity, product.lowStockThreshold);
  return {
    id: product.id,
    name: product.name,
    sellingPrice: toNumber(product.sellingPrice),
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    isActive: product.isActive,
    status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listPopularProducts(shopId: string) {
  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { shopId, status: "COMPLETED" } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });

  if (grouped.length === 0) {
    const fallback = await prisma.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { name: "asc" },
      take: 8,
    });
    return fallback.map(mapProduct);
  }

  const products = await prisma.product.findMany({
    where: { shopId, isActive: true, id: { in: grouped.map((row) => row.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return grouped
    .map((row) => byId.get(row.productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map(mapProduct);
}

export async function listProducts(shopId: string, query?: string) {
  const products = await prisma.product.findMany({
    where: {
      shopId,
      isActive: true,
      ...(query
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { name: "asc" },
  });
  return products.map(mapProduct);
}

export async function getProduct(shopId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, shopId, isActive: true },
  });
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return mapProduct(product);
}

export async function createProduct(
  shopId: string,
  input: {
    name: string;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
  },
) {
  const product = await prisma.product.create({
    data: {
      shopId,
      name: input.name.trim(),
      sellingPrice: input.sellingPrice,
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold,
    },
  });
  return mapProduct(product);
}

export async function updateProduct(
  shopId: string,
  id: string,
  input: Partial<{
    name: string;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
  }>,
) {
  const existing = await prisma.product.findFirst({
    where: { id, shopId, isActive: true },
  });
  if (!existing) {
    throw new AppError("Product not found", 404);
  }
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.sellingPrice !== undefined ? { sellingPrice: input.sellingPrice } : {}),
      ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
      ...(input.lowStockThreshold !== undefined
        ? { lowStockThreshold: input.lowStockThreshold }
        : {}),
    },
  });
  return mapProduct(product);
}

export async function deactivateProduct(shopId: string, id: string) {
  const existing = await prisma.product.findFirst({
    where: { id, shopId, isActive: true },
  });
  if (!existing) {
    throw new AppError("Product not found", 404);
  }
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}
