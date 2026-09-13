import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Not found", 404));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.issues[0]?.message ?? "Invalid input",
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof Error && err.message.includes("Custom range")) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (env.nodeEnv !== "test") {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
}
