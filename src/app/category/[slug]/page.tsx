import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productCardSelect, publicProduct } from "@/lib/queries";
import { ChipBar, Grid, PageTitle, ProductCard } from "@/components/cards";
import { routes } from "@/lib/routes";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    db.category.findUnique({
      where: { slug },
      include: { products: { where: publicProduct, select: productCardSelect, orderBy: { createdAt: "desc" } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!category) notFound();
  return (
    <>
      <PageTitle title={category.name} sub={`${category.products.length} products`} />
      <ChipBar
        active={routes.category(slug)}
        chips={[{ href: routes.shop, label: "All" }, ...categories.map((c) => ({ href: routes.category(c.slug), label: c.name }))]}
      />
      <Grid>
        {category.products.map((p) => (
          <ProductCard key={p.id} product={p} className="" />
        ))}
      </Grid>
    </>
  );
}
