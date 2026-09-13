import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "https://shopdashboard-1.onrender.com",
  cookieName: process.env.COOKIE_NAME ?? "shopbook_token",
  timeZone: process.env.TZ ?? "Asia/Kolkata",
};

export function assertEnv() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!env.jwtSecret || env.jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters");
  }
}
