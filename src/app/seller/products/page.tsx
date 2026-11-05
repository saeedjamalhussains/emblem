import Link from "next/link";
import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { formatPaise } from "@/lib/format";
import { resubmitProduct, updateStockAndPrice } from "@/app/actions/seller";
import { PageTitle, StatusPill } from "@/components/cards";
import { routes } from "@/lib/routes";
import { PRODUCT } from "@/config/status";

export default async function SellerProducts({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  const { seller } = await requireSeller();
  const products = await db.product.findMany({
    where: { sellerId: seller.id },
    include: { identity: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {submitted && <div className="mt-6 border border-ok/40 bg-ok/5 p-4 text-[13px] text-ok">Product submitted for review.</div>}
      <div className="flex items-end justify-between">
        <PageTitle title="Products" />
        <Link href={routes.seller.newProduct} className="btn-primary mb-6">+ New product</Link>
      </div>
      <div className="card divide-y divide-line">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-48 flex-1">
              <div className="flex items-center gap-2">
                {p.status === PRODUCT.APPROVED ? (
                  <Link href={routes.product(p.id)} className=" hover:opacity-60">{p.title}</Link>
                ) : (
                  <span className="">{p.title}</span>
                )}
                <StatusPill status={p.status} />
                {p.customizable && <span className="pill">Customisable</span>}
              </div>
              <div className="mt-1 text-[11px] text-muted">{p.identity.name} · {p.category.name}</div>
              {p.moderationNote && <div className="mt-1 text-[11px] text-warn">Moderator: {p.moderationNote}</div>}
              {p.status === PRODUCT.CHANGES_REQUESTED && (
                <form action={resubmitProduct} className="mt-2 flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="description" defaultValue={p.description} className="input py-1 text-[11px]" />
                  <button className="btn-ghost py-1 text-[11px]">Resubmit</button>
                </form>
              )}
            </div>
            <form action={updateStockAndPrice} className="flex items-center gap-2 text-[11px]">
              <input type="hidden" name="id" value={p.id} />
              <label className="text-muted">₹</label>
              <input name="price" defaultValue={p.pricePaise / 100} className="input w-24 py-1" />
              <label className="text-muted">Stock</label>
              <input name="stock" type="number" min={0} defaultValue={p.stock} className="input w-20 py-1" />
              <button className="text-muted hover:text-fg">Save</button>
            </form>
            <div className="w-20 text-right text-[13px]">{formatPaise(p.pricePaise)}</div>
          </div>
        ))}
        {products.length === 0 && <p className="p-6 text-[13px] text-muted">No products yet.</p>}
      </div>
    </>
  );
}
