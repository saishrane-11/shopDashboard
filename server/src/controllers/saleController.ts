import type { Request, Response } from "express";
import { cancelSale, createSale, getSale, listSales } from "../services/saleService.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createSaleSchema } from "../validators/sale.js";

export const postSale = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const body = createSaleSchema.parse(req.body);
  const data = await createSale(shopId, body.items);
  res.status(201).json({ success: true, data });
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await listSales(shopId, {
    period: typeof req.query.period === "string" ? req.query.period : undefined,
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
    q: typeof req.query.q === "string" ? req.query.q : undefined,
  });
  res.json({ success: true, data });
});

export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await getSale(shopId, req.params.id as string);
  res.json({ success: true, data });
});

export const postCancelSale = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await cancelSale(shopId, req.params.id as string);
  res.json({ success: true, data });
});
