import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { type CustomOptions, formatPaise, parseJson } from "@/lib/format";
import { GUARANTEE_DAYS, identityTypeLabel } from "@/config/rules";
import { Emblem, ProductCard, Row } from "@/components/cards";
import { AddToCart } from "./add-to-cart";
import { routes } from "@/lib/routes";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, ...publicProduct },
    include: { identity: true, seller: true, category: true },
  });
  if (!product) notFound();
  const options = product.customizable ? parseJson<CustomOptions>(product.customOptions) : null;
  const related = await db.product.findMany({
    where: { ...publicProduct, identityId: product.identityId, id: { not: product.id } },
    select: productCardSelect,
    take: 8,
  });

  return (
    <>
      <nav className="mt-6 text-[11px] text-muted">
        <Link href={routes.shop} className="hover:text-fg">Shop</Link>
        {" / "}
        <Link href={routes.category(product.category.slug)} className="hover:text-fg">{product.category.name}</Link>
        {" / "}
        <Link href={routes.identity(product.identity.slug)} className="hover:text-fg">{product.identity.name}</Link>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
        <AddToCart
          product={{
            id: product.id,
            title: product.title,
            color: product.identity.color,
            identity: product.identity.name,
            category: product.category.slug,
            stock: product.stock,
          }}
          options={options}
        >
          <Link href={routes.identity(product.identity.slug)} className="flex items-center gap-2.5 text-[13px] hover:opacity-60">
            <Emblem name={product.identity.name} color={product.identity.color} size={28} />
            {product.identity.name}
          </Link>
          <h1 className="mt-5 text-[24px] leading-8">{product.title}</h1>
          <div className="mt-1 text-[18px]">{formatPaise(product.pricePaise)}</div>
          <p className="mt-5 text-[13px] leading-5 text-muted">{product.description}</p>
        </AddToCart>
      </div>

      {/* Three-column detail strip, after the kit's Design / Quality / Sustainability block. */}
      <section className="mt-20 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
        <div>
          <div className="eyebrow">Seller</div>
          <div className="mt-3 text-[15px]">
            <Link href={routes.store(product.seller.slug)} className="hover:opacity-60">{product.seller.storeName}</Link>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-muted">
            Reviewed and invited by the marketplace. Ships this item directly — {product.stock > 0 ? `${product.stock} in stock` : "currently out of stock"}.
          </p>
        </div>
        <div>
          <div className="eyebrow">Authorisation</div>
          <div className="mt-3 text-[15px]">Official {identityTypeLabel(product.identity.type).toLowerCase().replace(/s$/, "")} merchandise</div>
          <p className="mt-2 text-[13px] leading-5 text-muted">
            The seller&apos;s right to represent {product.identity.name} has been verified, and this listing was approved before going live.
          </p>
        </div>
        <div>
          <div className="eyebrow">Guarantee</div>
          <div className="mt-3 text-[15px]">{GUARANTEE_DAYS}-day purchase guarantee</div>
          <p className="mt-2 text-[13px] leading-5 text-muted">
            Damaged, incorrect, wrongly personalised or unauthorised items can be reported within {GUARANTEE_DAYS} days of delivery.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <Row title={`More from ${product.identity.name}`} href={routes.identity(product.identity.slug)}>
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Row>
      )}
    </>
  );
}
