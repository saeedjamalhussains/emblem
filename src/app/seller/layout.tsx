import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { SubNav } from "@/components/subnav";
import { routes } from "@/lib/routes";
import { ORDER } from "@/config/status";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { seller } = await requireSeller();
  const toDispatch = await db.sellerOrder.count({ where: { sellerId: seller.id, status: ORDER.PLACED } });
  return (
    <>
      <SubNav
        title={seller.storeName}
        links={[
          { href: routes.seller.home, label: "Overview" },
          { href: routes.seller.products, label: "Products" },
          { href: routes.seller.orders, label: "Orders", count: toDispatch },
          { href: routes.seller.identities, label: "Identities" },
          { href: routes.store(seller.slug), label: "View storefront" },
        ]}
      />
      {children}
    </>
  );
}
