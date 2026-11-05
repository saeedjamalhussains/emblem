import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { Grid, IdentityCard, ProductCard, Row } from "@/components/cards";
import { CheckIcon } from "@/components/icons";
import { AUTHORIZATION, SELLER } from "@/config/status";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = await db.seller.findUnique({
    where: { slug },
    include: {
      products: { where: publicProduct, select: productCardSelect, orderBy: { createdAt: "desc" } },
      authorizations: { where: { status: AUTHORIZATION.APPROVED }, include: { identity: true } },
    },
  });
  if (!seller || seller.status !== SELLER.ACTIVE) notFound();

  return (
    <>
      <section className="-mx-4 bg-band px-4 py-16 text-center sm:-mx-8">
        <div className="eyebrow flex items-center justify-center gap-1.5"><CheckIcon /> Verified seller</div>
        <h1 className="mt-2 text-[32px] leading-10">{seller.storeName}</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted">{seller.description}</p>
      </section>

      {seller.authorizations.length > 0 && (
        <Row title="Authorised to sell">
          {seller.authorizations.map((a) => (
            <IdentityCard key={a.id} identity={a.identity} />
          ))}
        </Row>
      )}

      <div className="mt-16 mb-6 flex items-baseline justify-between">
        <h2 className="text-[18px]">All products</h2>
        <span className="text-[13px] text-muted">{seller.products.length} products</span>
      </div>
      <Grid>
        {seller.products.map((p) => (
          <ProductCard key={p.id} product={p} className="" />
        ))}
      </Grid>
    </>
  );
}
