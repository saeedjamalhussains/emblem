# Emblem — curated merchandise marketplace

Capstone prototype of a curated, identity-driven merch marketplace: invitation-only sellers,
verified identity authorisation, product moderation, multi-seller checkout, and a double-entry
ledger with a 20% guarantee reserve. **Zero product commission.** Payments run in **test mode only**.

"Emblem" is a working name — change `SITE.name` in `src/config/site.ts`.

## Run it

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and seeds demo data
npm run dev              # http://localhost:3000
```

Reset to a clean demo state at any time with `npm run db:reset`. Run the ledger tests with `npm test`.

### Demo accounts (local only — defined in `prisma/seed.ts`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@emblem.test | admin1234 |
| Customer | customer@emblem.test | customer1234 |
| Sellers | loomline@ / hawks@ / nightfall@emblem.test | seller1234 |

All identities, sellers and products in the seed are fictional.

## End-to-end flow (milestone 1)

1. **Apply** — anyone submits a seller application at `/sell`.
2. **Review** — admin approves, rejects or requests info at `/admin/applications`. Approval issues a
   single-use invitation link (14 days). Email delivery isn't wired up, so the link is shown to the admin.
3. **Activate** — the applicant opens `/invite/<token>`, names their store and sets a password. They start on tier 1.
4. **Authorise** — seller requests the right to represent an identity at `/seller/identities`; admin verifies at `/admin/authorizations`.
5. **List** — seller submits a product (optionally personalisable: text and/or colours). It stays hidden until approved at `/admin/products`.
6. **Discover & buy** — customers browse the Shop (filtered by category), personalise with a live preview, and check out across several sellers in one payment.
7. **Split & fulfil** — each order splits into one seller order per seller. Sellers see only their part and mark it dispatched with a tracking number.
8. **Deliver** — delivery is confirmed by the courier (simulated by admin at `/admin/orders`) or by the customer — never by the seller.
9. **Ledger** — `/admin/ledger` shows the trial balance and every transaction.

### Ledger postings

| Event | Debit | Credit |
|---|---|---|
| Customer pays | `gateway:clearing` (total) | `seller:<id>:pending` (each seller's subtotal) |
| Delivered | `seller:<id>:pending` | `seller:<id>:payable` (80%) + `seller:<id>:reserve` (20%) |

All money is stored as integer paise. `postTransaction` refuses any transaction whose debits ≠ credits.

## Where to edit what

| To change… | Edit |
|---|---|
| Name, announcement bar, hero, footer and other copy | `src/config/site.ts` |
| Guarantee days, reserve %, invitation expiry, cart limit, subscription tiers, identity types | `src/config/rules.ts` |
| Status values (application, product, order…) and badge colours | `src/config/status.ts` |
| A page URL | `src/lib/routes.ts` (and rename the matching folder in `src/app/`) |
| Colours, fonts, buttons, inputs, chips | `src/app/globals.css` (tokens at the top, light and dark) |
| Product card, identity tile, grid, chips, page title | `src/components/cards.tsx` |
| Header / footer / logo | `src/components/header.tsx`, `footer.tsx`, `logo.tsx` |
| Placeholder product drawings | `src/components/product-art.tsx` |
| Logo artwork | replace `assets/logo-source.png`, then `python3 scripts/prepare-logo.py` |
| Database tables | `prisma/schema.prisma`, then create a migration |
| Demo data | `prisma/seed.ts`, then `npm run db:seed` |

## Structure

```
src/config/              site copy, business rules, status values — the usual places to edit
src/lib/                 db, auth, routes, form helpers, ledger, delivery, shared queries, formatting
src/components/          shared UI (cards, header, footer, logo, icons, product art, forms)
src/app/                 pages: / · /shop · /category/[slug] · /product/[id] · /identity/[slug] · /store/[slug]
                         /cart · /checkout · /orders · /sell · /invite/[token] · /login · /register
src/app/seller/          seller hub
src/app/admin/           admin console
src/app/actions/         server actions: auth, shop, admission, seller, admin
prisma/                  schema, migrations, seed
```

Conventions: use `routes.*` for links, the constants in `config/status.ts` for statuses, and the helpers
in `lib/form.ts` to read form fields. The signed-in user is cached per request, so calling `currentUser()`
from several places on one page costs one database lookup.

## Not built yet (next milestones)

- Reserve release after 30 days, seller settlements and payouts
- Guarantee claims, disputes, refunds and recovery against reserve/future settlements
- Subscription billing, rolling 12-month sales, quarterly tier reassessment
- GST TCS / TDS 194-O and processing-fee entries in the ledger
- Real payment provider (test mode), email delivery, image and document uploads, product editing

## Licence

Copyright © 2026 Emblem. All rights reserved. This is proprietary software: no one may use, copy,
modify or distribute it without prior written permission. See [LICENSE](LICENSE).
