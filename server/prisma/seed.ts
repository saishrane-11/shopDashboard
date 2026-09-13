import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      name: "Ramesh",
      phone: "9999999999",
      email: "demo@shopbook.dev",
      passwordHash: await bcrypt.hash("demo1234", 12),
    },
  });

  const shop = await prisma.shop.create({
    data: {
      name: "Ramesh Kirana",
      ownerId: owner.id,
    },
  });

  const catalog = [
    { name: "Maggi", sellingPrice: 12, stockQuantity: 50, lowStockThreshold: 8 },
    { name: "Bread", sellingPrice: 35, stockQuantity: 25, lowStockThreshold: 6 },
    { name: "Milk", sellingPrice: 30, stockQuantity: 40, lowStockThreshold: 10 },
    { name: "Biscuits", sellingPrice: 10, stockQuantity: 60, lowStockThreshold: 12 },
    { name: "Cold Drink", sellingPrice: 25, stockQuantity: 30, lowStockThreshold: 8 },
  ];

  const products = await Promise.all(
    catalog.map((item) =>
      prisma.product.create({
        data: { ...item, shopId: shop.id },
      }),
    ),
  );

  const byName = Object.fromEntries(products.map((p) => [p.name, p]));

  const sampleSales: Array<{ hoursAgo: number; items: Array<{ name: string; qty: number }> }> = [
    { hoursAgo: 1, items: [{ name: "Maggi", qty: 2 }] },
    { hoursAgo: 2, items: [{ name: "Bread", qty: 1 }] },
    { hoursAgo: 3, items: [{ name: "Milk", qty: 2 }] },
    { hoursAgo: 5, items: [{ name: "Biscuits", qty: 3 }, { name: "Cold Drink", qty: 1 }] },
    { hoursAgo: 26, items: [{ name: "Milk", qty: 1 }] },
    { hoursAgo: 50, items: [{ name: "Maggi", qty: 4 }] },
    { hoursAgo: 80, items: [{ name: "Bread", qty: 2 }, { name: "Biscuits", qty: 2 }] },
  ];

  for (const sample of sampleSales) {
    const createdAt = new Date(Date.now() - sample.hoursAgo * 60 * 60 * 1000);
    const lines = sample.items.map((item) => {
      const product = byName[item.name];
      const unitPrice = Number(product.sellingPrice);
      return {
        productId: product.id,
        quantity: item.qty,
        unitPrice,
        totalPrice: unitPrice * item.qty,
      };
    });
    const totalAmount = lines.reduce((sum, line) => sum + line.totalPrice, 0);

    await prisma.$transaction(async (tx) => {
      await tx.sale.create({
        data: {
          shopId: shop.id,
          totalAmount,
          status: "COMPLETED",
          createdAt,
          items: { create: lines },
        },
      });
      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stockQuantity: { decrement: line.quantity } },
        });
      }
    });
  }

  console.log("Seeded demo shop.");
  console.log("Login with phone 9999999999 or demo@shopbook.dev / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
