import { Router } from "express";
import {
  dashboard,
  getShopSettings,
  patchShopSettings,
  reportsSales,
  reportsTopProducts,
} from "../controllers/miscController.js";

export const dashboardRouter = Router();
dashboardRouter.get("/", dashboard);

export const reportsRouter = Router();
reportsRouter.get("/sales", reportsSales);
reportsRouter.get("/top-products", reportsTopProducts);

export const shopRouter = Router();
shopRouter.get("/", getShopSettings);
shopRouter.patch("/", patchShopSettings);
