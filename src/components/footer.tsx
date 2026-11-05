import Link from "next/link";
import { SITE } from "@/config/site";
import { Logo } from "./logo";
import { routes } from "@/lib/routes";

const COLUMNS = [
  { title: "Shop", links: [{ href: routes.shop, label: "Shop all" }] },
  { title: "Customers", links: [{ href: routes.orders, label: "Your orders" }, { href: routes.cart, label: "Cart" }, { href: routes.register(), label: "Create an account" }] },
  { title: "Sellers", links: [{ href: routes.sell, label: "Apply to sell" }, { href: routes.seller.home, label: "Seller hub" }] },
];

export function Footer() {
  return (
    <footer className="bg-band">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-8 md:grid-cols-[repeat(3,minmax(0,180px))_1fr]">
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <div className="eyebrow mb-4">{c.title}</div>
            <ul className="space-y-1.5 text-[13px]">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:opacity-60">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:justify-self-end md:max-w-sm">
          <Logo height={34} className="mb-5" />
          <p className="text-[18px] leading-6">{SITE.footer.headline}</p>
          <p className="mt-3 text-[13px] text-muted">{SITE.footer.body}</p>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 text-[11px] text-muted sm:px-8">©{SITE.name}</div>
    </footer>
  );
}
