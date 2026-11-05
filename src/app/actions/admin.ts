"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, randomToken, requireAdmin } from "@/lib/auth";
import { INVITATION_VALID_DAYS } from "@/config/rules";
import { markDelivered } from "@/lib/orders";
import { routes } from "@/lib/routes";
import { APPLICATION, AUTHORIZATION, PRODUCT, oneOf } from "@/config/status";
import { optional, text } from "@/lib/form";

// Decisions are bound per button (formAction), so they never come from user-editable form fields.
const APPLICATION_DECISIONS = [APPLICATION.APPROVED, APPLICATION.NEEDS_INFO, APPLICATION.REJECTED];
const PRODUCT_DECISIONS = [PRODUCT.APPROVED, PRODUCT.CHANGES_REQUESTED, PRODUCT.REJECTED];
const AUTHORIZATION_DECISIONS = [AUTHORIZATION.APPROVED, AUTHORIZATION.REJECTED];

export async function reviewApplication(decision: string, form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!oneOf(APPLICATION_DECISIONS, decision)) return;
  const note = optional(form, "note");

  await db.$transaction(async (tx) => {
    const app = await tx.sellerApplication.findUniqueOrThrow({ where: { id } });
    if (app.status === APPLICATION.APPROVED || app.status === APPLICATION.REJECTED) return; // decisions are final
    await tx.sellerApplication.update({ where: { id }, data: { status: decision, adminNote: note, reviewedAt: new Date() } });
    if (decision === APPLICATION.APPROVED) {
      await tx.invitation.create({
        data: {
          token: randomToken(),
          applicationId: id,
          email: app.email,
          expiresAt: new Date(Date.now() + INVITATION_VALID_DAYS * 86_400_000),
        },
      });
    }
  });
  await audit(admin.id, `application.${decision.toLowerCase()}`, id, note ?? undefined);
  revalidatePath(routes.admin.home, "layout");
}

/** Replaces an expired or lost invitation with a fresh link. */
export async function reissueInvitation(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "applicationId");
  const invitation = await db.invitation.findUnique({ where: { applicationId: id } });
  if (!invitation || invitation.usedAt) return;
  await db.invitation.update({
    where: { id: invitation.id },
    data: { token: randomToken(), expiresAt: new Date(Date.now() + INVITATION_VALID_DAYS * 86_400_000) },
  });
  await audit(admin.id, "invitation.reissued", id);
  revalidatePath(routes.admin.applications);
}

export async function moderateProduct(decision: string, form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!oneOf(PRODUCT_DECISIONS, decision)) return;
  const note = optional(form, "note");
  await db.product.updateMany({ where: { id, status: PRODUCT.PENDING_REVIEW }, data: { status: decision, moderationNote: note } });
  await audit(admin.id, `product.${decision.toLowerCase()}`, id, note ?? undefined);
  revalidatePath("/", "layout");
}

export async function reviewAuthorization(decision: string, form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  if (!oneOf(AUTHORIZATION_DECISIONS, decision)) return;
  const note = optional(form, "note");
  await db.identityAuthorization.updateMany({
    where: { id, status: AUTHORIZATION.PENDING },
    data: { status: decision, adminNote: note, reviewedAt: new Date() },
  });
  await audit(admin.id, `authorization.${decision.toLowerCase()}`, id, note ?? undefined);
  revalidatePath(routes.admin.home, "layout");
}

/** Stands in for the courier's delivery webhook until a logistics integration exists. */
export async function simulateCourierDelivery(form: FormData) {
  const admin = await requireAdmin();
  const id = text(form, "id");
  await markDelivered(id, "courier (simulated)");
  await audit(admin.id, "order.delivered", id, "simulated courier confirmation");
  revalidatePath(routes.admin.orders);
}
