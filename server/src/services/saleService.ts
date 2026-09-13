import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { dateRange } from "../utils/dates.js";
import { toNumber } from "../utils/money.js";

function mapSale(sale: {
  id: string;
  totalAmount: { toString(): string };
  status: "COMPLETED" | "CANCELLED";
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: { toString(): string };
    totalPrice: { toString(): string };
    product: { name: string };
  }>;
}) {
  return {
    id: sale.id,
    totalAmount: toNumber(sale.totalAmount),
    status: sale.status,
    createdAt: sale.createdAt,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      totalPrice: toNumber(item.totalPrice),
    })),
  };
}

export async function createSale(
  shopId: string,
  items: Array<{ productId: string; quantity: number }>,
) {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  return prisma.$transaction(async (tx) => {
    const createdItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const [productId, quantity] of merged.entries()) {
      const product = await tx.product.findFirst({
        where: { id: productId, shopId, isActive: true },
      });
      if (!product) {
        throw new AppError("One of the products was not found", 404);
      }
      if (product.stockQuantity < quantity) {
        throw new AppError(
          `Insufficient stock. Only ${product.stockQuantity} units are available.`,
          400,
        );
      }

      const unitPrice = toNumber(product.sellingPrice);
      createdItems.push({
        productId,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });

      const updated = await tx.product.updateMany({
        where: { id: productId, shopId, stockQuantity: { gte: quantity } },
        data: { stockQuantity: { decrement: quantity } },
      });
      if (updated.count !== 1) {
        throw new AppError(
          `Insufficient stock. Only ${product.stockQuantity} units are available.`,
          400,
        );
      }
    }

    const totalAmount = createdItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const sale = await tx.sale.create({
      data: {
        shopId,
        totalAmount,
        status: "COMPLETED",
        items: {
          create: createdItems,
        },
      },
      include: { items: { include: { product: true } } },
    });

    return mapSale(sale);
  });
}

export async function listSales(
  shopId: string,
  filters: { period?: string; from?: string; to?: string; q?: string },
) {
  const period = filters.period ?? "today";
  const { start, end } = dateRange(period, filters.from, filters.to);
  const sales = await prisma.sale.findMany({
    where: {
      shopId,
      createdAt: { gte: start, lt: end },
      ...(filters.q
        ? {
            items: {
              some: {
                product: { name: { contains: filters.q, mode: "insensitive" as const } },
              },
            },
          }
        : {}),
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return sales.map(mapSale);
}

export async function getSale(shopId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, shopId },
    include: { items: { include: { product: true } } },
  });
  if (!sale) {
    throw new AppError("Sale not found", 404);
  }
  return mapSale(sale);
}

export async function cancelSale(shopId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id, shopId },
      include: { items: true },
    });
    if (!sale) {
      throw new AppError("Sale not found", 404);
    }
    if (sale.status === "CANCELLED") {
      throw new AppError("This sale is already cancelled", 400);
    }

    for (const item of sale.items) {
      await tx.product.updateMany({
        where: { id: item.productId, shopId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }

    const updated = await tx.sale.update({
      where: { id: sale.id },
      data: { status: "CANCELLED" },
      include: { items: { include: { product: true } } },
    });

    return mapSale(updated);
  });
}
