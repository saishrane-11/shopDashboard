import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { signAuthToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { Response } from "express";

function publicUser(user: { id: string; name: string; phone: string; email: string | null }) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
  };
}

export async function registerAccount(
  input: {
    shopName: string;
    ownerName: string;
    phone: string;
    email?: string;
    password: string;
  },
  res: Response,
) {
  const email = input.email?.trim() ? input.email.trim().toLowerCase() : null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.ownerName.trim(),
          phone: input.phone.trim(),
          email,
          passwordHash: await hashPassword(input.password),
        },
      });
      const shop = await tx.shop.create({
        data: {
          name: input.shopName.trim(),
          ownerId: user.id,
        },
      });
      return { user, shop };
    });

    const token = signAuthToken({ userId: result.user.id, shopId: result.shop.id });
    setAuthCookie(res, token);

    return {
      user: publicUser(result.user),
      shop: { id: result.shop.id, name: result.shop.name },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("An account with this phone or email already exists", 409);
    }
    throw error;
  }
}

export async function loginAccount(
  input: { identifier: string; password: string },
  res: Response,
) {
  const identifier = input.identifier.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: identifier }, { email: identifier.toLowerCase() }],
    },
    include: { shop: true },
  });

  if (!user || !user.shop) {
    throw new AppError("Invalid phone/email or password", 401);
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid phone/email or password", 401);
  }

  const token = signAuthToken({ userId: user.id, shopId: user.shop.id });
  setAuthCookie(res, token);

  return {
    user: publicUser(user),
    shop: { id: user.shop.id, name: user.shop.name },
  };
}

export function logoutAccount(res: Response) {
  clearAuthCookie(res);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  });
  if (!user || !user.shop) {
    throw new AppError("Account not found", 404);
  }
  return {
    user: publicUser(user),
    shop: { id: user.shop.id, name: user.shop.name },
  };
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Account not found", 404);
  }
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new AppError("Current password is incorrect", 400);
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
}
