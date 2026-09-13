import { Router } from "express";
import { getSaleById, getSales, postCancelSale, postSale } from "../controllers/saleController.js";

export const saleRouter = Router();

saleRouter.post("/", postSale);
saleRouter.get("/", getSales);
saleRouter.get("/:id", getSaleById);
saleRouter.post("/:id/cancel", postCancelSale);
