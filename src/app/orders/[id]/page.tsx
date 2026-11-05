import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { GUARANTEE_DAYS } from "@/config/rules";
import { formatDate, formatPaise } from "@/lib/format";
import { PageTitle, StatusPill } from "@/components/cards";
import { CustomizationNote } from "@/components/customization";
import { confirmReceipt } from "@/app/actions/shop";
import { routes } from "@/lib/routes";
import { ORDER, ORDER_STEPS } from "@/config/status";


export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(routes.order(id));
  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: { sellerOrders: { include: { seller: true, items: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {placed && (
        <div className="mt-8 border border-ok/40 bg-ok/5 p-4 text-[13px] text-ok">
          Order placed. Payment {order.paymentRef} confirmed (test mode).
        </div>
      )}
      <PageTitle
        title={`Order #${order.id.slice(-8)}`}
        sub={`${formatDate(order.createdAt)} · ${formatPaise(order.totalPaise)} · Delivering to ${order.shipName}`}
      />
      <div className="space-y-4">
        {order.sellerOrders.map((so) => {
          const step = ORDER_STEPS.indexOf(so.status);
          const guaranteeEnds = so.deliveredAt ? new Date(so.deliveredAt.getTime() + GUARANTEE_DAYS * 86_400_000) : null;
          return (
            <section key={so.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-muted">From <span className="text-fg">{so.seller.storeName}</span></div>
                <StatusPill status={so.status} />
              </div>
              <ol className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                {ORDER_STEPS.map((s, i) => (
                  <li key={s} className={`border-t-2 pt-2 ${i <= step ? "border-fg text-fg" : "border-line text-muted"}`}>
                    {s.toLowerCase()}
                  </li>
                ))}
              </ol>
              {so.trackingRef && <p className="mt-3 text-[11px] text-muted">Tracking: <span className="font-mono">{so.trackingRef}</span></p>}
              {so.status === ORDER.DISPATCHED && (
                <form action={confirmReceipt} className="mt-3">
                  <input type="hidden" name="id" value={so.id} />
                  <button className="btn-ghost py-1.5 text-[11px]">I&apos;ve received this</button>
                </form>
              )}
              <ul className="mt-4 divide-y divide-line text-[13px]">
                {so.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-2">
                    <div>
                      {i.title} × {i.quantity}
                      <CustomizationNote value={i.customization} />
                    </div>
                    <div>{formatPaise(i.unitPricePaise * i.quantity)}</div>
                  </li>
                ))}
              </ul>
              {guaranteeEnds && (
                <p className="mt-3 text-[11px] text-muted">
                  Covered by the purchase guarantee until {formatDate(guaranteeEnds)}. Reporting a problem arrives in the next milestone.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
