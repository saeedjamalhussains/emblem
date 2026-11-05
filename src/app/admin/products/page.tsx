import { db } from "@/lib/db";
import { type CustomOptions, formatPaise, parseJson } from "@/lib/format";
import { moderateProduct } from "@/app/actions/admin";
import { PageTitle, ProductArt } from "@/components/cards";
import { AUTHORIZATION, PRODUCT } from "@/config/status";

export default async function ProductModeration() {
  const products = await db.product.findMany({
    where: { status: PRODUCT.PENDING_REVIEW },
    include: { seller: true, identity: true, category: true },
    orderBy: { createdAt: "asc" },
  });
  // Flag listings whose seller isn't (or is no longer) authorised for the identity.
  const auths = await db.identityAuthorization.findMany({ where: { status: AUTHORIZATION.APPROVED } });
  const authorized = new Set(auths.map((a) => `${a.sellerId}:${a.identityId}`));

  return (
    <>
      <PageTitle title="Product moderation" sub="Nothing goes live until it's approved here." />
      <div className="space-y-4">
        {products.map((p) => {
          const options = parseJson<CustomOptions>(p.customOptions);
          const ok = authorized.has(`${p.sellerId}:${p.identityId}`);
          return (
            <section key={p.id} className="card flex flex-col gap-5 p-5 sm:flex-row">
              <ProductArt title={p.title} color={p.identity.color} identity={p.identity.name} category={p.category.slug} className="aspect-[4/5] w-32 shrink-0" />
              <div className="flex-1">
                <div className="">{p.title}</div>
                <div className="text-[13px] text-muted">
                  {p.seller.storeName} · {p.identity.name} · {p.category.name} · {formatPaise(p.pricePaise)} · {p.stock} in stock
                </div>
                <p className="mt-2 text-[13px]">{p.description}</p>
                {options && (
                  <p className="mt-2 text-[11px] text-muted">
                    Personalisation: {options.text ? `${options.text.label} (≤${options.text.maxLength})` : "no text"}
                    {options.colors.length > 0 && ` · colours ${options.colors.join(", ")}`}
                  </p>
                )}
                <p className={`mt-2 text-[11px] ${ok ? "text-ok" : "text-bad"}`}>
                  {ok ? "✓ Seller is authorised for this identity" : "✗ Seller is not authorised for this identity"}
                </p>
                <form className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="note" placeholder="Note to seller" className="input max-w-sm flex-1 py-1.5" />
                  <button formAction={moderateProduct.bind(null, PRODUCT.APPROVED)} disabled={!ok} className="btn-primary py-1.5">Approve</button>
                  <button formAction={moderateProduct.bind(null, PRODUCT.CHANGES_REQUESTED)} className="btn-ghost py-1.5">Request changes</button>
                  <button formAction={moderateProduct.bind(null, PRODUCT.REJECTED)} className="btn-danger py-1.5">Reject</button>
                </form>
              </div>
            </section>
          );
        })}
        {products.length === 0 && <p className="text-[13px] text-muted">The moderation queue is empty.</p>}
      </div>
    </>
  );
}
