import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

export type AuthTokenPayload = {
  userId: string;
  shopId: string;
};

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & Partial<AuthTokenPayload>;
    if (!decoded.userId || !decoded.shopId) {
      throw new AppError("Invalid session", 401);
    }
    return { userId: decoded.userId, shopId: decoded.shopId };
  } catch {
    throw new AppError("Invalid session", 401);
  }
}
