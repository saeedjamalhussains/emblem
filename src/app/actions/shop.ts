"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";
import { customerPaymentEntries, postTransaction } from "@/lib/ledger";
import { type CustomOptions, type Customization, parseJson } from "@/lib/format";
import { publicProduct } from "@/lib/queries";
import { markDelivered } from "@/lib/orders";
import type { FormState } from "@/components/action-form";
import { routes } from "@/lib/routes";
import { PRODUCT, SELLER } from "@/config/status";
import { clampInt, text } from "@/lib/form";
import { MAX_QUANTITY } from "@/config/rules";

/** Validates a customer's personalisation against the options the seller offers. */
function readCustomization(form: FormData, options: CustomOptions | null): Customization | null | string {
  if (!options) return null;
  const c: Customization = {};
  if (options.text) {
    const value = text(form, "customText");
    if (!value) return `Enter the ${options.text.label.toLowerCase()}.`;
    if (value.length > options.text.maxLength) return `${options.text.label} can be at most ${options.text.maxLength} characters.`;
    c.text = value;
  }
  if (options.colors.length > 0) {
    const color = text(form, "customColor");
    if (!options.colors.includes(color)) return "Choose a colour.";
    c.color = color;
  }
  return c;
}

export async function addToCart(_: FormState, form: FormData): Promise<FormState> {
  const productId = text(form, "productId");
  const user = await currentUser();
  if (!user) redirect(routes.login(routes.product(productId)));

  const quantity = clampInt(form, "quantity", 1, MAX_QUANTITY);
  const product = await db.product.findFirst({ where: { id: productId, ...publicProduct } });
  if (!product) return { error: "This product is no longer available." };
  if (product.stock < quantity) return { error: `Only ${product.stock} left in stock.` };

  const options = product.customizable ? parseJson<CustomOptions>(product.customOptions) : null;
  const customization = readCustomization(form, options);
  if (typeof customization === "string") return { error: customization };

  const serialized = customization ? JSON.stringify(customization) : null;
  const existing = await db.cartItem.findFirst({ where: { userId: user.id, productId, customization: serialized } });
  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(MAX_QUANTITY, existing.quantity + quantity) } });
  } else {
    await db.cartItem.create({ data: { userId: user.id, productId, quantity, customization: serialized } });
  }
  revalidatePath("/", "layout");
  return { ok: "Added to cart." };
}

/** One-tap "+" from a product card; anything needing input falls back to the product page. */
export async function quickAdd(form: FormData) {
  const result = await addToCart(undefined, form);
  if (result?.error) redirect(routes.product(text(form, "productId")));
}

export async function removeFromCart(form: FormData) {
  const user = await requireUser(routes.cart);
  await db.cartItem.deleteMany({ where: { id: text(form, "id"), userId: user.id } });
  revalidatePath("/", "layout");
}

export async function updateCartQuantity(form: FormData) {
  const user = await requireUser(routes.cart);
  const quantity = clampInt(form, "quantity", 1, MAX_QUANTITY);
  await db.cartItem.updateMany({ where: { id: text(form, "id"), userId: user.id }, data: { quantity } });
  revalidatePath("/", "layout");
}

/**
 * Places an order in test mode: no real payment provider is called. The order is
 * split into one SellerOrder per seller and the payment is posted to the ledger.
 */
export async function checkout(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(routes.checkout);
  const shipName = text(form, "shipName");
  const shipAddress = text(form, "shipAddress");
  const shipPhone = text(form, "shipPhone");
  if (!shipName || !shipAddress || !/^[0-9+\- ]{8,15}$/.test(shipPhone)) {
    return { error: "Enter a delivery name, address and valid phone number." };
  }

  let orderId: string;
  try {
    orderId = await db.$transaction(async (tx) => {
      const items = await tx.cartItem.findMany({ where: { userId: user.id }, include: { product: { include: { seller: true } } } });
      if (items.length === 0) throw new Error("Your cart is empty.");

      const bySeller = new Map<string, typeof items>();
      for (const item of items) {
        const p = item.product;
        if (p.status !== PRODUCT.APPROVED || p.seller.status !== SELLER.ACTIVE) throw new Error(`${p.title} is no longer available.`);
        // Conditional decrement guards against overselling under concurrent checkouts.
        const updated = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) throw new Error(`Not enough stock for ${p.title}.`);
        bySeller.set(p.sellerId, [...(bySeller.get(p.sellerId) ?? []), item]);
      }

      const totalPaise = items.reduce((s, i) => s + i.product.pricePaise * i.quantity, 0);
      const paymentRef = `test_pay_${randomBytes(8).toString("hex")}`;
      const order = await tx.order.create({
        data: { userId: user.id, totalPaise, paymentRef, shipName, shipAddress, shipPhone },
      });

      const perSeller: { sellerId: string; amountPaise: number }[] = [];
      for (const [sellerId, sellerItems] of bySeller) {
        const subtotalPaise = sellerItems.reduce((s, i) => s + i.product.pricePaise * i.quantity, 0);
        perSeller.push({ sellerId, amountPaise: subtotalPaise });
        await tx.sellerOrder.create({
          data: {
            orderId: order.id,
            sellerId,
            subtotalPaise,
            items: {
              create: sellerItems.map((i) => ({
                productId: i.productId,
                title: i.product.title,
                unitPricePaise: i.product.pricePaise,
                quantity: i.quantity,
                customization: i.customization,
              })),
            },
          },
        });
      }

      await postTransaction(tx, {
        kind: "CUSTOMER_PAYMENT",
        reference: order.id,
        memo: `Customer payment ${paymentRef} (test mode)`,
        entries: customerPaymentEntries(totalPaise, perSeller),
      });
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return order.id;
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Checkout failed." };
  }

  revalidatePath("/", "layout");
  redirect(`${routes.order(orderId)}?placed=1`);
}

export async function confirmReceipt(form: FormData) {
  const user = await requireUser(routes.orders);
  const id = text(form, "id");
  const so = await db.sellerOrder.findFirst({ where: { id, order: { userId: user.id } } });
  if (!so) return;
  await markDelivered(so.id, "customer");
  revalidatePath(routes.order(so.orderId));
}
