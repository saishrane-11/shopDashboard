import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();

function agent() {
  return request.agent(app);
}

async function registerShop(suffix: string) {
  const client = agent();
  const res = await client.post("/api/auth/register").send({
    shopName: `Shop ${suffix}`,
    ownerName: `Owner ${suffix}`,
    phone: `98${suffix.padStart(8, "0")}`.slice(0, 10),
    email: `${suffix}@shop.test`,
    password: "password1",
  });
  expect(res.status).toBe(201);
  return client;
}

describe("Shop Book API", () => {
  beforeAll(async () => {
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shop.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers, logs in, and rejects a bad password", async () => {
    const res = await agent().post("/api/auth/register").send({
      shopName: "Auth Shop",
      ownerName: "Asha",
      phone: "9000000001",
      email: "asha@shop.test",
      password: "password1",
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.passwordHash).toBeUndefined();

    const bad = await agent().post("/api/auth/login").send({
      identifier: "9000000001",
      password: "wrong-password",
    });
    expect(bad.status).toBe(401);

    const good = await agent().post("/api/auth/login").send({
      identifier: "asha@shop.test",
      password: "password1",
    });
    expect(good.status).toBe(200);

    const me = await agent().get("/api/auth/me");
    expect(me.status).toBe(401);
  });

  it("protects routes and isolates shops", async () => {
    const shopA = await registerShop("11111111");
    const shopB = await registerShop("22222222");

    const productA = await shopA.post("/api/products").send({
      name: "Maggi",
      sellingPrice: 12,
      stockQuantity: 10,
      lowStockThreshold: 2,
    });
    expect(productA.status).toBe(201);
    const productId = productA.body.data.id;

    const otherList = await shopB.get("/api/products");
    expect(otherList.body.data).toHaveLength(0);

    const steal = await shopB.get(`/api/products/${productId}`);
    expect(steal.status).toBe(404);

    const edit = await shopB.patch(`/api/products/${productId}`).send({ sellingPrice: 99 });
    expect(edit.status).toBe(404);

    const sale = await shopA.post("/api/sales").send({
      items: [{ productId, quantity: 2 }],
    });
    expect(sale.status).toBe(201);
    const saleId = sale.body.data.id;

    const cancelOther = await shopB.post(`/api/sales/${saleId}/cancel`);
    expect(cancelOther.status).toBe(404);

    const otherSales = await shopB.get("/api/sales?period=month");
    expect(otherSales.body.data.find((s: { id: string }) => s.id === saleId)).toBeUndefined();
  });

  it("creates products and blocks cross-shop access", async () => {
    const shop = await registerShop("33333333");
    const created = await shop.post("/api/products").send({
      name: "Bread",
      sellingPrice: 35,
      stockQuantity: 20,
      lowStockThreshold: 5,
    });
    expect(created.status).toBe(201);

    const updated = await shop.patch(`/api/products/${created.body.data.id}`).send({
      sellingPrice: 40,
      stockQuantity: 18,
    });
    expect(updated.body.data.sellingPrice).toBe(40);

    const removed = await shop.delete(`/api/products/${created.body.data.id}`);
    expect(removed.status).toBe(200);
    const listed = await shop.get("/api/products");
    expect(listed.body.data).toHaveLength(0);
  });

  it("creates sales with stock updates, snapshots price, and restores stock on cancel", async () => {
    const shop = await registerShop("44444444");
    const maggi = await shop.post("/api/products").send({
      name: "Maggi",
      sellingPrice: 12,
      stockQuantity: 50,
      lowStockThreshold: 5,
    });
    const bread = await shop.post("/api/products").send({
      name: "Bread",
      sellingPrice: 35,
      stockQuantity: 10,
      lowStockThreshold: 2,
    });

    const insufficient = await shop.post("/api/sales").send({
      items: [{ productId: maggi.body.data.id, quantity: 80 }],
    });
    expect(insufficient.status).toBe(400);
    expect(insufficient.body.message).toContain("Only 50");

    const sale = await shop.post("/api/sales").send({
      items: [
        { productId: maggi.body.data.id, quantity: 2 },
        { productId: bread.body.data.id, quantity: 1 },
      ],
    });
    expect(sale.status).toBe(201);
    expect(sale.body.data.totalAmount).toBe(59);
    expect(sale.body.data.items[0].unitPrice).toBeDefined();

    const afterSale = await shop.get(`/api/products/${maggi.body.data.id}`);
    expect(afterSale.body.data.stockQuantity).toBe(48);

    await shop.patch(`/api/products/${maggi.body.data.id}`).send({ sellingPrice: 15 });
    const detail = await shop.get(`/api/sales/${sale.body.data.id}`);
    const maggiLine = detail.body.data.items.find((item: { productId: string }) => item.productId === maggi.body.data.id);
    expect(maggiLine.unitPrice).toBe(12);
    expect(maggiLine.totalPrice).toBe(24);

    const cancelled = await shop.post(`/api/sales/${sale.body.data.id}/cancel`);
    expect(cancelled.body.data.status).toBe("CANCELLED");
    const restored = await shop.get(`/api/products/${maggi.body.data.id}`);
    expect(restored.body.data.stockQuantity).toBe(50);

    const reports = await shop.get("/api/reports/sales");
    expect(reports.body.data.summary.today).toBe(0);
  });
});
