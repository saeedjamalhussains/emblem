// Business rules. Change a number here and it applies across the app.

/** Days after delivery a customer can report a problem. */
export const GUARANTEE_DAYS = 30;

/** Share of each delivered seller order held back until the guarantee ends. */
export const GUARANTEE_RESERVE_RATE = 0.2;

/** Days a seller invitation link stays valid. */
export const INVITATION_VALID_DAYS = 14;

/** Days a sign-in session lasts. */
export const SESSION_DAYS = 30;

/** Most of one item a customer can put in the cart. */
export const MAX_QUANTITY = 10;

/** What a product's merchandise represents. */
export const IDENTITY_TYPES = [
  { key: "BRAND", label: "Brands" },
  { key: "TEAM", label: "Teams" },
  { key: "CREATOR", label: "Creators" },
  { key: "GAMING", label: "Gaming" },
  { key: "MUSIC", label: "Music" },
  { key: "COMMUNITY", label: "Communities" },
] as const;

export function identityTypeLabel(key: string) {
  return IDENTITY_TYPES.find((t) => t.key === key)?.label ?? key;
}

// Illustrative subscription tiers (rolling 12-month eligible sales, in paise).
// Assessment and billing come in a later milestone; sellers start on tier 1.
export const SUBSCRIPTION_TIERS = [
  { tier: 1, upToPaise: 5_00_000_00, monthlyFeePaise: 499_00 },
  { tier: 2, upToPaise: 15_00_000_00, monthlyFeePaise: 999_00 },
  { tier: 3, upToPaise: 30_00_000_00, monthlyFeePaise: 1_999_00 },
  { tier: 4, upToPaise: 60_00_000_00, monthlyFeePaise: 3_499_00 },
  { tier: 5, upToPaise: 1_50_00_000_00, monthlyFeePaise: 6_999_00 },
  { tier: 6, upToPaise: 5_00_00_000_00, monthlyFeePaise: 12_999_00 },
  { tier: 7, upToPaise: Infinity, monthlyFeePaise: null }, // custom enterprise
] as const;
