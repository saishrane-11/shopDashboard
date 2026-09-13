import { env } from "../config/env.js";

function partsInZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function zonedDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const asZone = partsInZone(new Date(utcGuess), env.timeZone);
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  const actual = Date.UTC(asZone.year, asZone.month - 1, asZone.day, hour, minute, second);
  return new Date(utcGuess + (desired - actual));
}

export function startOfDay(date = new Date()) {
  const { year, month, day } = partsInZone(date, env.timeZone);
  return zonedDate(year, month, day);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function startOfWeek(date = new Date()) {
  const start = startOfDay(date);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: env.timeZone,
    weekday: "short",
  }).format(start);
  const offset = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return addDays(start, -offset);
}

export function startOfMonth(date = new Date()) {
  const { year, month } = partsInZone(date, env.timeZone);
  return zonedDate(year, month, 1);
}

export function dateRange(period: string, from?: string, to?: string) {
  const now = new Date();
  if (period === "today") {
    const start = startOfDay(now);
    return { start, end: addDays(start, 1) };
  }
  if (period === "yesterday") {
    const end = startOfDay(now);
    return { start: addDays(end, -1), end };
  }
  if (period === "week") {
    const start = startOfWeek(now);
    return { start, end: addDays(startOfDay(now), 1) };
  }
  if (period === "month") {
    const start = startOfMonth(now);
    return { start, end: addDays(startOfDay(now), 1) };
  }
  if (period === "custom") {
    if (!from || !to) {
      throw new Error("Custom range requires from and to dates");
    }
    const start = startOfDay(new Date(`${from}T00:00:00`));
    const end = addDays(startOfDay(new Date(`${to}T00:00:00`)), 1);
    return { start, end };
  }
  const start = startOfDay(now);
  return { start, end: addDays(start, 1) };
}

export function formatDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: env.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
