import { prisma } from "../lib/prisma.js";
import { addDays, dateRange, formatDayKey, startOfDay, startOfMonth } from "../utils/dates.js";
import { toNumber } from "../utils/money.js";

export async function salesReport(
  shopId: string,
  trend: "daily" | "weekly" | "monthly" = "daily",
) {
  const today = dateRange("today");
  const week = dateRange("week");
  const month = dateRange("month");

  const [todayAgg, weekAgg, monthAgg] = await Promise.all([
    prisma.sale.aggregate({
      where: { shopId, status: "COMPLETED", createdAt: { gte: today.start, lt: today.end } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { shopId, status: "COMPLETED", createdAt: { gte: week.start, lt: week.end } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { shopId, status: "COMPLETED", createdAt: { gte: month.start, lt: month.end } },
      _sum: { totalAmount: true },
    }),
  ]);

  let rangeStart = addDays(startOfDay(), -6);
  if (trend === "weekly") rangeStart = addDays(startOfDay(), -41);
  if (trend === "monthly") rangeStart = startOfMonth(addDays(startOfDay(), -150));

  const sales = await prisma.sale.findMany({
    where: {
      shopId,
      status: "COMPLETED",
      createdAt: { gte: rangeStart, lt: today.end },
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const buckets = new Map<string, number>();
  for (const sale of sales) {
    const key =
      trend === "monthly"
        ? formatDayKey(sale.createdAt).slice(0, 7)
        : trend === "weekly"
          ? weekBucket(sale.createdAt)
          : formatDayKey(sale.createdAt);
    buckets.set(key, (buckets.get(key) ?? 0) + toNumber(sale.totalAmount));
  }

  const trendPoints = [...buckets.entries()].map(([label, total]) => ({ label, total }));

  return {
    summary: {
      today: toNumber(todayAgg._sum.totalAmount ?? 0),
      week: toNumber(weekAgg._sum.totalAmount ?? 0),
      month: toNumber(monthAgg._sum.totalAmount ?? 0),
    },
    trend: trendPoints,
  };
}

function weekBucket(date: Date) {
  return formatDayKey(date);
}

export async function topProducts(shopId: string) {
  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: { shopId, status: "COMPLETED" },
    },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((row) => row.productId) } },
    select: { id: true, name: true },
  });
  const names = new Map(products.map((p) => [p.id, p.name]));

  return grouped.map((row) => ({
    productId: row.productId,
    name: names.get(row.productId) ?? "Product",
    quantitySold: row._sum.quantity ?? 0,
    revenue: toNumber(row._sum.totalPrice ?? 0),
  }));
}
