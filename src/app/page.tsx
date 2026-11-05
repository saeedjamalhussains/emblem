import Link from "next/link";
import { db } from "@/lib/db";
import { SITE } from "@/config/site";
import { initials } from "@/lib/format";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { ChipBar, Grid, ProductCard, Row, SectionTitle } from "@/components/cards";
import { Silhouette } from "@/components/product-art";
import { routes } from "@/lib/routes";

// The homepage shows a slice of the catalogue; the Shop page has everything.
const HOME_GRID_SIZE = 24;

export default async function Home() {
  const [products, categories, featured] = await Promise.all([
    db.product.findMany({ where: publicProduct, select: productCardSelect, orderBy: { createdAt: "desc" }, take: HOME_GRID_SIZE }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    // Hero: a team jersey if one is live, the classic piece of identity merch.
    db.product.findFirst({
      where: { ...publicProduct, title: { contains: "Jersey" }, identity: { type: "TEAM" } },
      select: productCardSelect,
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const hero = featured ?? products[0];

  return (
    <>
      {/* Hero: full-bleed, copy bottom-left with a white button, as in the kit. */}
      {hero && (
        <Link
          href={routes.product(hero.id)}
          className="group relative -mx-4 block h-[520px] overflow-hidden sm:-mx-8 sm:h-[640px]"
          style={{ background: hero.identity.color }}
        >
          <Silhouette
            title={hero.title}
            category={hero.category.slug}
            color="rgba(255,255,255,.16)"
            mark={initials(hero.identity.name)}
            className="absolute top-1/2 right-[-10%] h-[120%] -translate-y-1/2 transition duration-700 group-hover:scale-105 sm:right-[6%] sm:h-[110%]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-10 left-4 max-w-md text-white sm:bottom-16 sm:left-16">
            <div className="eyebrow text-white/70">{hero.identity.name}</div>
            <p className="mt-2 text-[24px] leading-8">
              {SITE.hero.lines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
            <span className="mt-5 inline-block bg-white px-4 py-2 text-[13px] text-black">{SITE.hero.cta}</span>
          </div>
        </Link>
      )}

      <Row title="New arrivals" href={routes.shop}>
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </Row>

      <section className="mt-20">
        <SectionTitle title="Shop all" href={routes.shop} />
        <ChipBar active={routes.shop} chips={[{ href: routes.shop, label: "All" }, ...categories.map((c) => ({ href: routes.category(c.slug), label: c.name }))]} />
        <Grid>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} className="" />
          ))}
        </Grid>
      </section>

      <section className="-mx-4 mt-24 bg-band px-4 py-24 text-center sm:-mx-8">
        <h2 className="text-[24px] leading-8">{SITE.sellBand.title}</h2>
        <p className="mx-auto mt-8 max-w-[720px] text-[15px] leading-[22px]">{SITE.sellBand.body}</p>
        <Link href={routes.sell} className="btn-ghost mt-10">{SITE.sellBand.cta}</Link>
      </section>
    </>
  );
}
