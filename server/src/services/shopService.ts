import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export async function getShop(userId: string, shopId: string) {
  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: userId },
    include: { owner: true },
  });
  if (!shop) {
    throw new AppError("Shop not found", 404);
  }
  return {
    id: shop.id,
    name: shop.name,
    ownerName: shop.owner.name,
    phone: shop.owner.phone,
    email: shop.owner.email,
  };
}

export async function updateShop(
  userId: string,
  shopId: string,
  input: { shopName?: string; ownerName?: string; phone?: string; email?: string },
) {
  try {
    const shop = await prisma.shop.findFirst({
      where: { id: shopId, ownerId: userId },
    });
    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    const [updatedShop] = await prisma.$transaction([
      prisma.shop.update({
        where: { id: shopId },
        data: input.shopName ? { name: input.shopName.trim() } : {},
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          ...(input.ownerName ? { name: input.ownerName.trim() } : {}),
          ...(input.phone ? { phone: input.phone.trim() } : {}),
          ...(input.email !== undefined
            ? { email: input.email.trim() ? input.email.trim().toLowerCase() : null }
            : {}),
        },
      }),
    ]);

    return getShop(userId, updatedShop.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("This phone or email is already in use", 409);
    }
    throw error;
  }
}
