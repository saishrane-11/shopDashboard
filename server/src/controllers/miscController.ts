import type { Request, Response } from "express";
import { getDashboard } from "../services/dashboardService.js";
import { salesReport, topProducts } from "../services/reportService.js";
import { getShop, updateShop } from "../services/shopService.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { shopUpdateSchema } from "../validators/shop.js";

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await getDashboard(shopId);
  res.json({ success: true, data });
});

export const reportsSales = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const trend = req.query.trend === "weekly" || req.query.trend === "monthly" ? req.query.trend : "daily";
  const data = await salesReport(shopId, trend);
  res.json({ success: true, data });
});

export const reportsTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await topProducts(shopId);
  res.json({ success: true, data });
});

export const getShopSettings = asyncHandler(async (req: Request, res: Response) => {
  const { userId, shopId } = (req as AuthenticatedRequest).auth;
  const data = await getShop(userId, shopId);
  res.json({ success: true, data });
});

export const patchShopSettings = asyncHandler(async (req: Request, res: Response) => {
  const { userId, shopId } = (req as AuthenticatedRequest).auth;
  const body = shopUpdateSchema.parse(req.body);
  const data = await updateShop(userId, shopId, body);
  res.json({ success: true, data });
});
