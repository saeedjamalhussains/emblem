import Link from "next/link";
import { formatPaise, initials } from "@/lib/format";
import { identityTypeLabel } from "@/config/rules";
import { quickAdd } from "@/app/actions/shop";
import { ProductArt } from "./product-art";
import { statusLabel, statusTone } from "@/config/status";
import { ArrowIcon, PlusIcon } from "./icons";
import { routes } from "@/lib/routes";

export { ProductArt };

export function Emblem({ name, color, size = 64 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.32, background: color }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/** Identity tile: emblem on a grey square, name and type beneath — mirrors the kit's product card. */
export function IdentityCard({ identity }: { identity: { slug: string; name: string; type: string; color: string } }) {
  return (
    <Link href={routes.identity(identity.slug)} className="group w-[168px] shrink-0 sm:w-[200px]">
      <div className="flex aspect-square items-center justify-center bg-tile transition group-hover:bg-line/60">
        <Emblem name={identity.name} color={identity.color} size={84} />
      </div>
      <div className="mt-2.5 text-[13px]">{identity.name}</div>
      <div className="text-[13px] text-muted">{identityTypeLabel(identity.type)}</div>
    </Link>
  );
}

export type ProductCardData = {
  id: string;
  title: string;
  pricePaise: number;
  customizable: boolean;
  identity: { name: string; color: string };
  seller: { storeName: string };
  category: { slug: string };
};

export function ProductCard({ product, className = "w-[200px] shrink-0 sm:w-[251px]" }: { product: ProductCardData; className?: string }) {
  return (
    <div className={className}>
      <ProductArt
        title={product.title}
        color={product.identity.color}
        identity={product.identity.name}
        category={product.category.slug}
        className="aspect-[251/330]"
      >
        <Link href={routes.product(product.id)} className="absolute inset-0" aria-label={product.title} />
        {product.customizable && (
          <span className="pointer-events-none absolute top-3 left-3 bg-bg/90 px-2 py-0.5 text-[11px]">Personalise</span>
        )}
        {/* Quick add, like the kit's "+": personalised items open the product page instead. */}
        {product.customizable ? (
          <Link href={routes.product(product.id)} className="absolute right-2 bottom-2 p-1.5 hover:opacity-60" aria-label={`Personalise ${product.title}`}>
            <PlusIcon />
          </Link>
        ) : (
          <form action={quickAdd} className="absolute right-2 bottom-2">
            <input type="hidden" name="productId" value={product.id} />
            <button className="p-1.5 hover:opacity-60" aria-label={`Add ${product.title} to cart`}>
              <PlusIcon />
            </button>
          </form>
        )}
      </ProductArt>
      <Link href={routes.product(product.id)} className="mt-2.5 block text-[13px] leading-5 hover:opacity-70">
        <div>{product.title}</div>
        <div className="text-muted">{product.identity.name}</div>
        <div>{formatPaise(product.pricePaise)}</div>
      </Link>
    </div>
  );
}

export function SectionTitle({ title, href, center }: { title: string; href?: string; center?: boolean }) {
  return (
    <div className={`mb-6 flex items-baseline ${center ? "justify-center" : "justify-between"}`}>
      <h2 className="text-[18px] leading-6">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1.5 text-[13px] hover:opacity-60">
          View all <ArrowIcon />
        </Link>
      )}
    </div>
  );
}

export function Row({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <SectionTitle title={title} href={href} />
      <div className="row-scroll -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">{children}</div>;
}

const TONE_CLASS = { ok: "text-ok border-ok/50", warn: "text-warn border-warn/50", info: "text-fg border-fg/50", bad: "text-bad border-bad/50" };

export function StatusPill({ status }: { status: string }) {
  const tone = statusTone(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${tone ? TONE_CLASS[tone] : "border-line text-muted"}`}>
      {statusLabel(status)}
    </span>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: React.ReactNode }) {
  return (
    <div className="mt-10 mb-8">
      <h1 className="text-[24px] leading-8">{title}</h1>
      {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}

/** The kit's outlined filter chips. */
export function ChipBar({ chips, active }: { chips: { href: string; label: string }[]; active?: string }) {
  return (
    <div className="row-scroll -mx-4 mb-10 flex gap-2 overflow-x-auto border-b border-line px-4 pb-5 sm:-mx-8 sm:px-8">
      {chips.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className={`pill whitespace-nowrap ${active === c.href ? "bg-fg text-bg" : "hover:bg-fg hover:text-bg"}`}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
