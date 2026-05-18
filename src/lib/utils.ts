import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date as YYYY-MM-DD in en-CA locale (always zero-padded).
 */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Relative-time formatter, Chinese, two granularities only:
 *   <1m → "刚刚"
 *   <1h → "X 分钟前"
 *   <1d → "X 小时前"
 *   <30d → "X 天前"
 *   <12mo → "X 个月前"
 *   ≥1yr → "X 年前"
 */
export function timeAgo(input: string | Date, now: Date = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (Number.isNaN(diff) || diff < 0) return "";
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))} 个月前`;
  return `${Math.floor(diff / (86400 * 365))} 年前`;
}
