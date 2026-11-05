import { db } from "@/lib/db";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { ChipBar, Grid, PageTitle, ProductCard } from "@/components/cards";
import { routes } from "@/lib/routes";

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ where: publicProduct, select: productCardSelect, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <>
      <PageTitle title="Shop" />
      <ChipBar active={routes.shop} chips={[{ href: routes.shop, label: "All" }, ...categories.map((c) => ({ href: routes.category(c.slug), label: c.name }))]} />
      <Grid>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} className="" />
        ))}
      </Grid>
    </>
  );
}
