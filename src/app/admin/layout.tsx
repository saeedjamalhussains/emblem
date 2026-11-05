import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SubNav } from "@/components/subnav";
import { routes } from "@/lib/routes";
import { APPLICATION, AUTHORIZATION, ORDER, PRODUCT } from "@/config/status";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [apps, products, auths, toDeliver] = await Promise.all([
    db.sellerApplication.count({ where: { status: APPLICATION.SUBMITTED } }),
    db.product.count({ where: { status: PRODUCT.PENDING_REVIEW } }),
    db.identityAuthorization.count({ where: { status: AUTHORIZATION.PENDING } }),
    db.sellerOrder.count({ where: { status: ORDER.DISPATCHED } }),
  ]);
  return (
    <>
      <SubNav
        title="Admin"
        links={[
          { href: routes.admin.home, label: "Overview" },
          { href: routes.admin.applications, label: "Applications", count: apps },
          { href: routes.admin.products, label: "Product moderation", count: products },
          { href: routes.admin.authorizations, label: "Authorisations", count: auths },
          { href: routes.admin.orders, label: "Orders", count: toDeliver },
          { href: routes.admin.ledger, label: "Ledger" },
        ]}
      />
      {children}
    </>
  );
}
