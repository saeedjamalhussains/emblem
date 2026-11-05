// Read typed values out of submitted forms.

/** Trimmed text; empty string when missing. */
export function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

/** Exact value, untrimmed — for passwords. */
export function raw(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}

/** Trimmed text, or null when blank. */
export function optional(form: FormData, key: string) {
  return text(form, key) || null;
}

/** Whole number, or NaN when missing or malformed. */
export function int(form: FormData, key: string) {
  const s = text(form, key);
  return /^-?\d+$/.test(s) ? Number.parseInt(s, 10) : Number.NaN;
}

/** Whole number clamped into [min, max]; `fallback` (default min) when missing. */
export function clampInt(form: FormData, key: string, min: number, max: number, fallback = min) {
  const n = int(form, key);
  return Number.isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
}
