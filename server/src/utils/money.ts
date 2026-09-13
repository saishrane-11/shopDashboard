import type { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value: Decimal | number | string): number {
  return Number(value);
}
