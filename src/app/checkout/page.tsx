import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPaise } from "@/lib/format";
import { checkout } from "@/app/actions/shop";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";
import { routes } from "@/lib/routes";

export default async function CheckoutPage() {
  const user = await requireUser(routes.checkout);
  const items = await db.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  if (items.length === 0) redirect(routes.cart);
  const total = items.reduce((s, i) => s + i.product.pricePaise * i.quantity, 0);

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title="Checkout" />
      <ActionForm action={checkout} className="space-y-4">
        <div>
          <label className="label" htmlFor="shipName">Full name</label>
          <input id="shipName" name="shipName" defaultValue={user.name} required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="shipAddress">Delivery address</label>
          <textarea id="shipAddress" name="shipAddress" rows={3} required className="input" autoComplete="street-address" />
        </div>
        <div>
          <label className="label" htmlFor="shipPhone">Phone</label>
          <input id="shipPhone" name="shipPhone" required className="input" autoComplete="tel" />
        </div>
        <div className="card flex items-center justify-between p-4">
          <span className="text-muted">Total</span>
          <span className="text-[18px]">{formatPaise(total)}</span>
        </div>
        <div className="border border-warn/40 bg-warn/5 p-3 text-[11px] text-warn">
          Test mode: no money is taken. A simulated payment reference is recorded instead.
        </div>
        <Submit className="btn-primary w-full">Pay {formatPaise(total)} (test)</Submit>
      </ActionForm>
    </div>
  );
}
