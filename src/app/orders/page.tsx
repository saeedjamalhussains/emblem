import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPaise } from "@/lib/format";
import { PageTitle, StatusPill } from "@/components/cards";
import { routes } from "@/lib/routes";

export default async function OrdersPage() {
  const user = await requireUser(routes.orders);
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { sellerOrders: { include: { seller: true, items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageTitle title="Your orders" />
      {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={routes.order(o.id)} className="card block p-4 hover:border-fg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px]">
                <span className="font-mono text-muted">#{o.id.slice(-8)}</span> · {formatDate(o.createdAt)}
              </div>
              <div className="">{formatPaise(o.totalPaise)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
              {o.sellerOrders.map((so) => (
                <span key={so.id} className="flex items-center gap-1">
                  {so.seller.storeName} <StatusPill status={so.status} />
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
