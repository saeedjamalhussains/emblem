import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { formatDate, formatPaise } from "@/lib/format";
import { dispatchOrder } from "@/app/actions/seller";
import { PageTitle, StatusPill } from "@/components/cards";
import { CustomizationNote } from "@/components/customization";
import { ORDER } from "@/config/status";

export default async function SellerOrders() {
  const { seller } = await requireSeller();
  const orders = await db.sellerOrder.findMany({
    where: { sellerId: seller.id },
    include: { items: true, order: true },
    orderBy: { order: { createdAt: "desc" } },
  });

  return (
    <>
      <PageTitle title="Orders" sub="Only your part of each customer order is shown here." />
      <div className="space-y-3">
        {orders.map((so) => (
          <section key={so.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px]">
                <span className="font-mono text-muted">#{so.id.slice(-8)}</span> · {formatDate(so.order.createdAt)} · {so.order.shipName}
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={so.status} />
                <span className="">{formatPaise(so.subtotalPaise)}</span>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-[13px]">
              {so.items.map((i) => (
                <li key={i.id}>
                  {i.title} × {i.quantity}
                  <CustomizationNote value={i.customization} />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted">{so.order.shipAddress} · {so.order.shipPhone}</p>
            {so.status === ORDER.PLACED && (
              <form action={dispatchOrder} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={so.id} />
                <input name="trackingRef" required placeholder="Courier tracking number" className="input max-w-xs py-1.5" />
                <button className="btn-primary py-1.5">Mark dispatched</button>
              </form>
            )}
            {so.trackingRef && <p className="mt-2 text-[11px] text-muted">Tracking: <span className="font-mono">{so.trackingRef}</span></p>}
          </section>
        ))}
        {orders.length === 0 && <p className="text-[13px] text-muted">No orders yet.</p>}
      </div>
    </>
  );
}
