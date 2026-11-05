"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import type { FormState } from "@/components/action-form";
import { routes } from "@/lib/routes";
import { ROLE } from "@/config/status";
import { raw, text } from "@/lib/form";

function safeNext(next: FormDataEntryValue | null) {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = raw(form, "password");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await startSession(user.id);
  const next = safeNext(form.get("next"));
  redirect(next !== "/" ? next : user.role === ROLE.ADMIN ? routes.admin.home : user.role === ROLE.SELLER ? routes.seller.home : "/");
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  const password = raw(form, "password");
  if (!name || !email.includes("@")) return { error: "Enter your name and a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };
  const user = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/");
}
