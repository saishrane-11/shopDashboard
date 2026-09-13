import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions(): CookieOptions {
  const isProd = env.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
    maxAge: SEVEN_DAYS_MS,
  };
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(env.cookieName, token, cookieOptions());
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.cookieName, {
    ...cookieOptions(),
    maxAge: 0,
  });
}
