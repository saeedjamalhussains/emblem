import { db } from "@/lib/db";
import { formatDate, formatPaise } from "@/lib/format";
import { PageTitle } from "@/components/cards";
import { PRODUCT, SELLER } from "@/config/status";

export default async function AdminOverview() {
  const [sellers, liveProducts, orders, gmv, log] = await Promise.all([
    db.seller.count({ where: { status: SELLER.ACTIVE } }),
    db.product.count({ where: { status: PRODUCT.APPROVED } }),
    db.order.count(),
    db.order.aggregate({ _sum: { totalPaise: true } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  const stats = [
    { label: "Active sellers", value: sellers },
    { label: "Live products", value: liveProducts },
    { label: "Orders", value: orders },
    { label: "Gross sales (test)", value: formatPaise(gmv._sum.totalPaise ?? 0) },
  ];
  return (
    <>
      <PageTitle title="Overview" />
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-[11px] tracking-wide text-muted uppercase">{s.label}</div>
            <div className="mt-2 text-[24px]">{s.value}</div>
          </div>
        ))}
      </div>
      <h2 className="mt-10 mb-3">Audit trail</h2>
      <div className="card divide-y divide-line font-mono text-[11px]">
        {log.map((l) => (
          <div key={l.id} className="flex gap-4 px-4 py-2">
            <span className="text-muted">{formatDate(l.createdAt)} {l.createdAt.toLocaleTimeString("en-IN")}</span>
            <span className="text-fg">{l.action}</span>
            <span className="text-muted">{l.target.slice(-8)}</span>
            {l.detail && <span className="truncate">{l.detail}</span>}
          </div>
        ))}
        {log.length === 0 && <p className="p-4 text-muted">No activity yet.</p>}
      </div>
    </>
  );
}
