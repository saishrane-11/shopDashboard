import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter, reportsRouter, shopRouter } from "./routes/misc.js";
import { productRouter } from "./routes/products.js";
import { saleRouter } from "./routes/sales.js";

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", requireAuth, productRouter);
  app.use("/api/sales", requireAuth, saleRouter);
  app.use("/api/dashboard", requireAuth, dashboardRouter);
  app.use("/api/reports", requireAuth, reportsRouter);
  app.use("/api/shop", requireAuth, shopRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
