import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { identityTypeLabel } from "@/config/rules";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { Emblem, Grid, ProductCard } from "@/components/cards";
import { CheckIcon } from "@/components/icons";
import { routes } from "@/lib/routes";
import { AUTHORIZATION, SELLER } from "@/config/status";

export default async function IdentityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const identity = await db.identity.findUnique({
    where: { slug },
    include: {
      products: { where: publicProduct, select: productCardSelect, orderBy: { createdAt: "desc" } },
      authorizations: {
        where: { status: AUTHORIZATION.APPROVED, seller: { status: SELLER.ACTIVE } },
        include: { seller: true },
      },
    },
  });
  if (!identity) notFound();

  return (
    <>
      <section
        className="relative -mx-4 flex min-h-[320px] items-end overflow-hidden px-4 pt-16 pb-10 text-white sm:-mx-8 sm:px-16"
        style={{ background: identity.color }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/15 to-transparent" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="ring-4 ring-white/25 rounded-full">
            <Emblem name={identity.name} color={identity.color} size={104} />
          </div>
          <div>
            <div className="eyebrow text-white/75">{identityTypeLabel(identity.type)}</div>
            <h1 className="mt-1 text-[32px] leading-10">{identity.name}</h1>
            <p className="mt-1 max-w-xl text-[15px] text-white/85">{identity.description}</p>
          </div>
        </div>
      </section>

      {identity.authorizations.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-5 text-[13px]">
          <span className="eyebrow">Authorised sellers</span>
          {identity.authorizations.map((a) => (
            <Link key={a.id} href={routes.store(a.seller.slug)} className="flex items-center gap-1.5 hover:opacity-60">
              <CheckIcon /> {a.seller.storeName}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 mb-6 flex items-baseline justify-between">
        <h2 className="text-[18px]">Merchandise</h2>
        <span className="text-[13px] text-muted">{identity.products.length} products</span>
      </div>
      {identity.products.length === 0 ? (
        <p className="text-muted">No merchandise listed yet.</p>
      ) : (
        <Grid>
          {identity.products.map((p) => (
            <ProductCard key={p.id} product={p} className="" />
          ))}
        </Grid>
      )}
    </>
  );
}
