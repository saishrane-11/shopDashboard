import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { AppError } from "../utils/appError.js";
import { verifyAuthToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (!token) {
    next(new AppError("Please log in to continue", 401));
    return;
  }
  try {
    const payload = verifyAuthToken(token);
    (req as AuthenticatedRequest).auth = payload;
    next();
  } catch (error) {
    next(error);
  }
}
