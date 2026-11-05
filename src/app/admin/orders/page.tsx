import { db } from "@/lib/db";
import { formatDate, formatPaise } from "@/lib/format";
import { simulateCourierDelivery } from "@/app/actions/admin";
import { PageTitle, StatusPill } from "@/components/cards";
import { ORDER } from "@/config/status";

export default async function AdminOrders() {
  const orders = await db.sellerOrder.findMany({
    include: { seller: true, order: { include: { user: true } } },
    orderBy: { order: { createdAt: "desc" } },
    take: 100,
  });
  return (
    <>
      <PageTitle title="Seller orders" sub="Delivery is confirmed by the courier or the customer, never the seller." />
      <div className="card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Seller</th>
              <th className="p-3 text-right">Amount</th><th className="p-3">Status</th><th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((so) => (
              <tr key={so.id}>
                <td className="p-3 font-mono text-[11px]">#{so.id.slice(-8)}</td>
                <td className="p-3 text-muted">{formatDate(so.order.createdAt)}</td>
                <td className="p-3">{so.order.user.name}</td>
                <td className="p-3">{so.seller.storeName}</td>
                <td className="p-3 text-right">{formatPaise(so.subtotalPaise)}</td>
                <td className="p-3"><StatusPill status={so.status} /></td>
                <td className="p-3 text-right">
                  {so.status === ORDER.DISPATCHED && (
                    <form action={simulateCourierDelivery}>
                      <input type="hidden" name="id" value={so.id} />
                      <button className="btn-ghost py-1 text-[11px]">Simulate courier delivery</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-[13px] text-muted">No orders yet.</p>}
      </div>
    </>
  );
}
