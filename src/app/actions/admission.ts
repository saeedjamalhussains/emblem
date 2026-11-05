"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import { slugify } from "@/lib/format";
import type { FormState } from "@/components/action-form";
import { APPLICATION, ROLE } from "@/config/status";
import { raw, text } from "@/lib/form";


export async function submitApplication(_: FormState, form: FormData): Promise<FormState> {
  const data = {
    applicantName: text(form, "applicantName"),
    email: text(form, "email").toLowerCase(),
    businessName: text(form, "businessName"),
    gstin: text(form, "gstin").toUpperCase() || null,
    pan: text(form, "pan").toUpperCase() || null,
    description: text(form, "description"),
    categories: form.getAll("categories").map(String).join(", "),
    portfolioUrl: text(form, "portfolioUrl") || null,
    authorizationNotes: text(form, "authorizationNotes") || null,
  };
  if (!data.applicantName || !data.email.includes("@") || !data.businessName || data.description.length < 30) {
    return { error: "Fill in your name, email, business name and a description of at least 30 characters." };
  }
  if (!data.categories) return { error: "Choose at least one product category." };
  if (data.gstin && !/^[0-9]{2}[A-Z0-9]{13}$/.test(data.gstin)) return { error: "GSTIN should be 15 characters." };
  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.pan)) return { error: "PAN format looks wrong (e.g. ABCDE1234F)." };
  if (data.portfolioUrl && !/^https?:\/\//.test(data.portfolioUrl)) return { error: "Portfolio link must start with http:// or https://." };

  const open = await db.sellerApplication.findFirst({
    where: { email: data.email, status: { in: [APPLICATION.SUBMITTED, APPLICATION.NEEDS_INFO] } },
  });
  if (open) return { error: "You already have an application under review with this email." };

  const app = await db.sellerApplication.create({ data });
  await audit(null, "application.submitted", app.id);
  redirect(`/sell/submitted?id=${app.id}`);
}

/** Activates a seller account from an invitation link. */
export async function acceptInvitation(_: FormState, form: FormData): Promise<FormState> {
  const token = text(form, "token");
  const storeName = text(form, "storeName");
  const password = raw(form, "password");
  const invitation = await db.invitation.findUnique({ where: { token }, include: { application: true } });
  if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
    return { error: "This invitation is invalid, already used or expired." };
  }
  if (!storeName) return { error: "Enter a store name." };

  const slug = slugify(storeName);
  if (!slug) return { error: "Store name must contain letters or numbers." };
  if (await db.seller.findUnique({ where: { slug } })) return { error: "That store name is taken." };

  const existing = await db.user.findUnique({ where: { email: invitation.email }, include: { seller: true } });
  if (existing?.seller) return { error: "This email already has a seller account." };
  if (existing && !(await verifyPassword(password, existing.passwordHash))) {
    return { error: "An account with this email exists — enter its current password to convert it to a seller account." };
  }
  if (!existing && password.length < 8) return { error: "Choose a password of at least 8 characters." };

  const userId = await db.$transaction(async (tx) => {
    const user = existing
      ? await tx.user.update({ where: { id: existing.id }, data: { role: ROLE.SELLER } })
      : await tx.user.create({
          data: {
            email: invitation.email,
            name: invitation.application.applicantName,
            passwordHash: await hashPassword(password),
            role: ROLE.SELLER,
          },
        });
    await tx.seller.create({
      data: {
        userId: user.id,
        applicationId: invitation.applicationId,
        storeName,
        slug,
        description: invitation.application.description,
      },
    });
    await tx.invitation.update({ where: { id: invitation.id }, data: { usedAt: new Date() } });
    return user.id;
  });

  await audit(userId, "seller.activated", invitation.applicationId);
  await startSession(userId);
  redirect("/seller?welcome=1");
}
