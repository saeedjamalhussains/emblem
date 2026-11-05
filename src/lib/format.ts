const inrWhole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrPaise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** ₹2,499 for whole rupees, ₹1,999.20 when there are paise. */
export function formatPaise(paise: number) {
  return (paise % 100 === 0 ? inrWhole : inrPaise).format(paise / 100);
}

export function rupeesToPaise(input: string | number) {
  const n = typeof input === "number" ? input : Number.parseFloat(input);
  if (!Number.isFinite(n) || n < 0) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export type CustomOptions = {
  text: { label: string; maxLength: number } | null;
  colors: string[];
};

export type Customization = { text?: string; color?: string };

export function parseJson<T>(s: string | null | undefined): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
