import type { TravelPackage } from "./types";

const CURRENCY_SYMBOLS: Record<string, string> = { BDT: "৳", USD: "US$", EUR: "€", GBP: "£", INR: "₹", AED: "AED ", SAR: "SAR ", MYR: "RM ", SGD: "S$", THB: "฿" };

export const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "AED", "SAR", "MYR", "SGD", "THB", "INR"] as const;

export function formatMoney(amount: number, currency = "BDT"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const locale = currency === "BDT" ? "en-IN" : "en-US";
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
  return `${symbol}${n}`;
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", ...opts }).format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDate(value, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function durationLabel(p: Pick<TravelPackage, "duration_days" | "duration_nights">): string {
  const parts: string[] = [];
  if (p.duration_days) parts.push(`${p.duration_days} day${p.duration_days === 1 ? "" : "s"}`);
  if (p.duration_nights != null) parts.push(`${p.duration_nights} night${p.duration_nights === 1 ? "" : "s"}`);
  return parts.join(" / ");
}

/** Price label shown on cards. Never invents a number: only admin-entered amounts are displayed. */
export function priceLabel(p: Pick<TravelPackage, "price_mode" | "price_amount" | "price_currency">): string {
  if (p.price_mode === "on_request" || p.price_amount == null) return "Price on request";
  const money = formatMoney(Number(p.price_amount), p.price_currency);
  return p.price_mode === "starting_from" ? `Starting from ${money}` : money;
}

export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
