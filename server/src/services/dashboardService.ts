import { prisma } from "../lib/prisma.js";
import { dateRange } from "../utils/dates.js";
import { toNumber } from "../utils/money.js";

export async function getDashboard(shopId: string) {
  const { start, end } = dateRange("today");

  const [todaySales, productCount, products, recentSales] = await Promise.all([
    prisma.sale.findMany({
      where: {
        shopId,
        status: "COMPLETED",
        createdAt: { gte: start, lt: end },
      },
      select: { totalAmount: true },
    }),
    prisma.product.count({ where: { shopId, isActive: true } }),
    prisma.product.findMany({
      where: { shopId, isActive: true },
      select: { stockQuantity: true, lowStockThreshold: true },
    }),
    prisma.sale.findMany({
      where: { shopId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
  const todayTotal = todaySales.reduce((sum, sale) => sum + toNumber(sale.totalAmount), 0);

  return {
    todaySales: todayTotal,
    transactions: todaySales.length,
    products: productCount,
    lowStock,
    recentSales: recentSales.map((sale) => ({
      id: sale.id,
      totalAmount: toNumber(sale.totalAmount),
      status: sale.status,
      createdAt: sale.createdAt,
      summary: sale.items
        .map((item) => item.product.name)
        .slice(0, 2)
        .join(", "),
    })),
  };
}
