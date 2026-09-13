import type { Request, Response } from "express";
import {
  createProduct,
  deactivateProduct,
  getProduct,
  listPopularProducts,
  listProducts,
  updateProduct,
} from "../services/productService.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { productSchema, productUpdateSchema } from "../validators/product.js";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const popular = req.query.popular === "true";
  const data = popular ? await listPopularProducts(shopId) : await listProducts(shopId, q);
  res.json({ success: true, data });
});                       

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const data = await getProduct(shopId, req.params.id as string);
  res.json({ success: true, data });
});

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const body = productSchema.parse(req.body);
  const data = await createProduct(shopId, body);
  res.status(201).json({ success: true, data });
});

export const patchProduct = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  const body = productUpdateSchema.parse(req.body);
  const data = await updateProduct(shopId, req.params.id as string, body);
  res.json({ success: true, data });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { shopId } = (req as AuthenticatedRequest).auth;
  await deactivateProduct(shopId, req.params.id as string);
  res.json({ success: true, message: "Product removed" });
});
