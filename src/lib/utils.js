import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a rupee amount: 40000 -> "₹40,000". */
export function formatINR(value, digits = 0) {
  const amount = value ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/** Parse a backend ISO datetime into a readable date-time string. */
export function formatDateTime(value) {
  if (!value) return "—";
  return format(new Date(value), "dd-MM-yyyy, hh:mm a");
}

export function formatDate(value) {
  if (!value) return "—";
  return format(new Date(value), "dd-MM-yyyy");
}

/** First letter of each significant word: "John Doe" -> "JD". */
export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
