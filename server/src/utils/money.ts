type MoneyLike = string | number | { toString(): string };

export function toNumber(value: MoneyLike): number {
  return Number(value);
}