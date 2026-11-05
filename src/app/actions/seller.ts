"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, requireSeller } from "@/lib/auth";
import { type CustomOptions, rupeesToPaise } from "@/lib/format";
import type { FormState } from "@/components/action-form";
import { routes } from "@/lib/routes";
import { AUTHORIZATION, ORDER, PRODUCT } from "@/config/status";
import { clampInt, int, text } from "@/lib/form";


export async function createProduct(_: FormState, form: FormData): Promise<FormState> {
  const { user, seller } = await requireSeller();
  const title = text(form, "title");
  const description = text(form, "description");
  const identityId = text(form, "identityId");
  const categoryId = text(form, "categoryId");
  const stock = int(form, "stock");
  let pricePaise: number;
  try {
    pricePaise = rupeesToPaise(text(form, "price"));
  } catch {
    return { error: "Enter a valid price." };
  }
  if (!title || description.length < 10) return { error: "Add a title and a description of at least 10 characters." };
  if (pricePaise < 100) return { error: "Price must be at least ₹1." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock must be a whole number." };

  const authorized = await db.identityAuthorization.findFirst({
    where: { sellerId: seller.id, identityId, status: AUTHORIZATION.APPROVED },
  });
  if (!authorized) return { error: "You can only list products for identities you're authorised to represent." };
  if (!(await db.category.findUnique({ where: { id: categoryId } }))) return { error: "Choose a category." };

  let customOptions: CustomOptions | null = null;
  if (form.get("customizable") === "on") {
    const label = text(form, "textLabel");
    const maxLength = clampInt(form, "textMax", 1, 40, 12);
    const colors = text(form, "colors")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (colors.some((c) => !/^#[0-9a-fA-F]{6}$/.test(c))) return { error: "Colours must be hex codes like #1d4ed8." };
    if (!label && colors.length === 0) return { error: "A customisable product needs a text option, colours, or both." };
    customOptions = { text: label ? { label, maxLength } : null, colors };
  }

  const product = await db.product.create({
    data: {
      sellerId: seller.id,
      identityId,
      categoryId,
      title,
      description,
      pricePaise,
      stock,
      customizable: !!customOptions,
      customOptions: customOptions ? JSON.stringify(customOptions) : null,
      status: PRODUCT.PENDING_REVIEW,
    },
  });
  await audit(user.id, "product.submitted", product.id);
  redirect("/seller/products?submitted=1");
}

/** Price and stock changes don't need re-moderation; content edits will. */
export async function updateStockAndPrice(form: FormData) {
  const { seller } = await requireSeller();
  const stock = int(form, "stock");
  const pricePaise = rupeesToPaise(text(form, "price"));
  if (!Number.isInteger(stock) || stock < 0 || pricePaise < 100) return;
  await db.product.updateMany({ where: { id: text(form, "id"), sellerId: seller.id }, data: { stock, pricePaise } });
  revalidatePath(routes.seller.products);
}

export async function resubmitProduct(form: FormData) {
  const { user, seller } = await requireSeller();
  const id = text(form, "id");
  const updated = await db.product.updateMany({
    where: { id, sellerId: seller.id, status: PRODUCT.CHANGES_REQUESTED },
    data: { status: PRODUCT.PENDING_REVIEW, description: text(form, "description") || undefined },
  });
  if (updated.count) await audit(user.id, "product.resubmitted", id);
  revalidatePath(routes.seller.products);
}

export async function requestAuthorization(_: FormState, form: FormData): Promise<FormState> {
  const { user, seller } = await requireSeller();
  const identityId = text(form, "identityId");
  const evidence = text(form, "evidence");
  if (evidence.length < 10) return { error: "Describe your evidence (licence reference, agreement, ownership)." };
  if (!(await db.identity.findUnique({ where: { id: identityId } }))) return { error: "Choose an identity." };
  const existing = await db.identityAuthorization.findUnique({ where: { sellerId_identityId: { sellerId: seller.id, identityId } } });
  if (existing?.status === AUTHORIZATION.APPROVED) return { error: "You're already authorised for this identity." };
  if (existing?.status === AUTHORIZATION.PENDING) return { error: "A request for this identity is already under review." };
  await db.identityAuthorization.upsert({
    where: { sellerId_identityId: { sellerId: seller.id, identityId } },
    create: { sellerId: seller.id, identityId, evidence },
    update: { evidence, status: AUTHORIZATION.PENDING, adminNote: null, reviewedAt: null },
  });
  await audit(user.id, "authorization.requested", identityId);
  revalidatePath(routes.seller.identities);
  return { ok: "Request sent for review." };
}

export async function dispatchOrder(form: FormData) {
  const { user, seller } = await requireSeller();
  const id = text(form, "id");
  const trackingRef = text(form, "trackingRef");
  if (!trackingRef) return;
  const updated = await db.sellerOrder.updateMany({
    where: { id, sellerId: seller.id, status: ORDER.PLACED },
    data: { status: ORDER.DISPATCHED, trackingRef, dispatchedAt: new Date() },
  });
  if (updated.count) await audit(user.id, "order.dispatched", id, trackingRef);
  revalidatePath(routes.seller.orders);
}
