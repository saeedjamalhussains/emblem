import Link from "next/link";
import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { SUBSCRIPTION_TIERS } from "@/config/rules";
import { accounts } from "@/lib/ledger";
import { accountBalances } from "@/lib/orders";
import { formatPaise } from "@/lib/format";
import { PageTitle } from "@/components/cards";
import { routes } from "@/lib/routes";
import { AUTHORIZATION, PRODUCT } from "@/config/status";

export default async function SellerOverview({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { seller } = await requireSeller();
  const [balances, productCounts, authCount] = await Promise.all([
    accountBalances(`seller:${seller.id}:`),
    db.product.groupBy({ by: ["status"], where: { sellerId: seller.id }, _count: true }),
    db.identityAuthorization.count({ where: { sellerId: seller.id, status: AUTHORIZATION.APPROVED } }),
  ]);
  const balance = (account: string) => {
    const b = balances.find((r) => r.account === account);
    return b ? b.creditPaise - b.debitPaise : 0;
  };
  const tier = SUBSCRIPTION_TIERS.find((t) => t.tier === seller.tier) ?? SUBSCRIPTION_TIERS[0];
  const count = (s: string) => productCounts.find((p) => p.status === s)?._count ?? 0;

  const stats = [
    { label: "Awaiting delivery", value: formatPaise(balance(accounts.sellerPending(seller.id))), hint: "Paid by customers, not yet delivered" },
    { label: "Payable to you", value: formatPaise(balance(accounts.sellerPayable(seller.id))), hint: "80% of delivered orders" },
    { label: "Guarantee reserve", value: formatPaise(balance(accounts.sellerReserve(seller.id))), hint: "Released 30 days after delivery" },
    { label: "Platform fee", value: tier.monthlyFeePaise ? `${formatPaise(tier.monthlyFeePaise)}/mo` : "Custom", hint: `Tier ${tier.tier} · 0% commission` },
  ];

  return (
    <>
      {welcome && (
        <div className="mt-6 border border-ok/40 bg-ok/5 p-4 text-[13px] text-ok">
          Your seller account is active. Request authorisation for the identities you represent, then list your first product.
        </div>
      )}
      <PageTitle title="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-[11px] tracking-wide text-muted uppercase">{s.label}</div>
            <div className="mt-2 text-[24px]">{s.value}</div>
            <div className="mt-1 text-[11px] text-muted">{s.hint}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href={routes.seller.products} className="card p-5 hover:border-fg">
          <div className="">Products</div>
          <div className="mt-1 text-[13px] text-muted">{count(PRODUCT.APPROVED)} live · {count(PRODUCT.PENDING_REVIEW)} in review · {count(PRODUCT.CHANGES_REQUESTED)} need changes</div>
        </Link>
        <Link href={routes.seller.identities} className="card p-5 hover:border-fg">
          <div className="">Identities</div>
          <div className="mt-1 text-[13px] text-muted">{authCount} authorised</div>
        </Link>
        <Link href={routes.seller.newProduct} className="card p-5 hover:border-fg">
          <div className="">+ New product</div>
          <div className="mt-1 text-[13px] text-muted">Submitted for moderation before going live</div>
        </Link>
      </div>
    </>
  );
}
