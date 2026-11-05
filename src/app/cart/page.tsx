import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPaise } from "@/lib/format";
import { removeFromCart, updateCartQuantity } from "@/app/actions/shop";
import { PageTitle, ProductArt } from "@/components/cards";
import { CustomizationNote } from "@/components/customization";
import { routes } from "@/lib/routes";
import { MAX_QUANTITY } from "@/config/rules";

function Stepper({ id, quantity }: { id: string; quantity: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line text-[13px]">
      {[
        { q: quantity - 1, label: "−", disabled: quantity <= 1 },
        null,
        { q: quantity + 1, label: "+", disabled: quantity >= MAX_QUANTITY },
      ].map((b, i) =>
        b ? (
          <form key={i} action={updateCartQuantity}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="quantity" value={b.q} />
            <button disabled={b.disabled} className="px-3 py-1 hover:opacity-60 disabled:opacity-30" aria-label={b.label === "+" ? "Increase quantity" : "Decrease quantity"}>
              {b.label}
            </button>
          </form>
        ) : (
          <span key={i} className="min-w-5 text-center">{quantity}</span>
        ),
      )}
    </div>
  );
}

export default async function CartPage() {
  const user = await requireUser(routes.cart);
  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { identity: true, seller: true, category: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Group by seller so the customer sees how the order will be split.
  const groups = new Map<string, { storeName: string; items: typeof items }>();
  for (const item of items) {
    const g = groups.get(item.product.sellerId) ?? { storeName: item.product.seller.storeName, items: [] };
    g.items.push(item);
    groups.set(item.product.sellerId, g);
  }
  const total = items.reduce((s, i) => s + i.product.pricePaise * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-[24px]">Your bag is empty</h1>
        <Link href={routes.shop} className="btn-primary mt-8">Continue shopping</Link>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title={`Shopping bag (${count})`}
        sub={groups.size > 1 ? `Ships from ${groups.size} sellers — one payment, separate deliveries.` : undefined}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="space-y-10">
          {[...groups.entries()].map(([sellerId, g]) => (
            <section key={sellerId}>
              <div className="eyebrow mb-3">Shipped by {g.storeName}</div>
              <ul className="divide-y divide-line border-y border-line">
                {g.items.map((i) => (
                  <li key={i.id} className="flex gap-5 py-5">
                    <Link href={routes.product(i.productId)} className="shrink-0">
                      <ProductArt
                        title={i.product.title}
                        color={i.product.identity.color}
                        identity={i.product.identity.name}
                        category={i.product.category.slug}
                        className="h-[132px] w-[100px]"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-4 text-[13px]">
                        <Link href={routes.product(i.productId)} className="hover:opacity-60">{i.product.title}</Link>
                        <span>{formatPaise(i.product.pricePaise * i.quantity)}</span>
                      </div>
                      <div className="text-[13px] text-muted">{i.product.identity.name}</div>
                      <CustomizationNote value={i.customization} />
                      <div className="mt-auto flex items-center gap-5 pt-3">
                        <Stepper id={i.id} quantity={i.quantity} />
                        <form action={removeFromCart}>
                          <input type="hidden" name="id" value={i.id} />
                          <button className="text-[11px] text-muted underline underline-offset-4 hover:text-fg">Remove</button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="h-fit lg:sticky lg:top-40">
          <div className="bg-band p-6">
            <div className="text-[18px]">Order summary</div>
            <div className="mt-5 flex justify-between text-[13px]"><span className="text-muted">Subtotal</span>{formatPaise(total)}</div>
            <div className="mt-2 flex justify-between text-[13px]"><span className="text-muted">Shipping</span>Free</div>
            <div className="mt-5 flex justify-between border-t border-line pt-5 text-[15px]"><span>Total</span>{formatPaise(total)}</div>
          </div>
          <p className="mt-4 text-[13px] text-muted">Taxes included. Covered by the 30-day purchase guarantee.</p>
          <Link href={routes.checkout} className="btn-primary mt-4 w-full">Go to checkout</Link>
        </aside>
      </div>
    </>
  );
}
