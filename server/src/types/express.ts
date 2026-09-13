import type { Request } from "express";

export type AuthContext = {
  userId: string;
  shopId: string;
};

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};
