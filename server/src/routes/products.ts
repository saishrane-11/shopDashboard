import { Router } from "express";
import {
  deleteProduct,
  getProductById,
  getProducts,
  patchProduct,
  postProduct,
} from "../controllers/productController.js";
export const productRouter = Router();
productRouter.get("/", getProducts);
productRouter.post("/", postProduct);
productRouter.get("/:id", getProductById);
productRouter.patch("/:id", patchProduct);
productRouter.delete("/:id", deleteProduct);
