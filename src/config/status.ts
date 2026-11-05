// Every status value the database stores, in one place.
// Use these instead of typing strings, so a typo becomes a type error.

export const APPLICATION = { SUBMITTED: "SUBMITTED", NEEDS_INFO: "NEEDS_INFO", APPROVED: "APPROVED", REJECTED: "REJECTED" } as const;
export const SELLER = { ACTIVE: "ACTIVE", SUSPENDED: "SUSPENDED", CLOSED: "CLOSED" } as const;
export const AUTHORIZATION = { PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED" } as const;
export const PRODUCT = { PENDING_REVIEW: "PENDING_REVIEW", APPROVED: "APPROVED", CHANGES_REQUESTED: "CHANGES_REQUESTED", REJECTED: "REJECTED" } as const;
export const ORDER = { PLACED: "PLACED", DISPATCHED: "DISPATCHED", DELIVERED: "DELIVERED", CANCELLED: "CANCELLED" } as const;
export const ROLE = { CUSTOMER: "CUSTOMER", SELLER: "SELLER", ADMIN: "ADMIN" } as const;

/** Order progress shown to customers, in sequence. */
export const ORDER_STEPS: readonly string[] = [ORDER.PLACED, ORDER.DISPATCHED, ORDER.DELIVERED];

/** True when `value` is one of `allowed` (narrows a plain string to the status type). */
export function oneOf<T extends string>(allowed: readonly T[], value: string): value is T {
  return (allowed as readonly string[]).includes(value);
}

/** Colour of a status badge: good, waiting, in progress or bad. */
const TONE: Record<string, "ok" | "warn" | "info" | "bad"> = {
  APPROVED: "ok",
  ACTIVE: "ok",
  DELIVERED: "ok",
  SUBMITTED: "warn",
  PENDING: "warn",
  PENDING_REVIEW: "warn",
  PLACED: "warn",
  NEEDS_INFO: "warn",
  CHANGES_REQUESTED: "warn",
  DISPATCHED: "info",
  REJECTED: "bad",
  CANCELLED: "bad",
  SUSPENDED: "bad",
  CLOSED: "bad",
};

export function statusTone(status: string) {
  return TONE[status];
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}
