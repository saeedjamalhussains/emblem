// Brand and on-page copy. Edit text here — no component changes needed.
import { GUARANTEE_DAYS } from "./rules";

export const SITE = {
  name: "Emblem",
  description: "Curated merchandise from verified brands, teams, creators and communities.",
  announcement: `Every seller verified · Every identity authorised · ${GUARANTEE_DAYS}-day purchase guarantee`,
  hero: {
    lines: ["Merch from the names you follow.", "Verified sellers, authorised designs."],
    cta: "Shop now",
  },
  sellBand: {
    title: "The Art of Fewer, Better Sellers",
    body: `Sellers join by application and invitation, and can only list merchandise for identities they're authorised to represent. Sellers pay a flat monthly fee instead of a commission on every sale, and every order is covered by our ${GUARANTEE_DAYS}-day purchase guarantee.`,
    cta: "Apply to sell",
  },
  footer: {
    headline: "Fewer sellers. Verified merchandise. Every day.",
    body: `0% product commission for sellers. Every order is covered by a ${GUARANTEE_DAYS}-day purchase guarantee. Payments run in test mode.`,
  },
} as const;
