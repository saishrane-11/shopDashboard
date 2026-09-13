import type { Request, Response } from "express";
import { changePassword, getMe, loginAccount, logoutAccount, registerAccount } from "../services/authService.js";
import type { AuthenticatedRequest } from "../types/express.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { changePasswordSchema, loginSchema, registerSchema } from "../validators/auth.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const data = await registerAccount(
    {
      shopName: body.shopName,
      ownerName: body.ownerName,
      phone: body.phone,
      email: body.email || undefined,
      password: body.password,
    },
    res,
  );
  res.status(201).json({ success: true, data });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const data = await loginAccount(body, res);
  res.json({ success: true, data });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  logoutAccount(res);
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as AuthenticatedRequest).auth;
  const data = await getMe(userId);
  res.json({ success: true, data });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as AuthenticatedRequest).auth;
  const body = changePasswordSchema.parse(req.body);
  await changePassword(userId, body);
  res.json({ success: true, message: "Password updated" });
});
