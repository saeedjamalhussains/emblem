import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { routes } from "./routes";
import { ROLE, SELLER } from "@/config/status";
import { SESSION_DAYS } from "@/config/rules";

const COOKIE = "emblem_session";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export async function startSession(userId: string) {
  const id = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { id, userId, expiresAt } });
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (id) await db.session.deleteMany({ where: { id } });
  store.delete(COOKIE);
}

/** The signed-in user. Cached per request, so the header, layouts and page share one lookup. */
export const currentUser = cache(async () => {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const session = await db.session.findUnique({
    where: { id },
    include: { user: { include: { seller: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

export async function requireUser(next = "/") {
  const user = await currentUser();
  if (!user) redirect(routes.login(next));
  return user;
}

export async function requireAdmin() {
  const user = await requireUser(routes.admin.home);
  if (user.role !== ROLE.ADMIN) redirect("/");
  return user;
}

export async function requireSeller() {
  const user = await requireUser(routes.seller.home);
  if (user.role !== ROLE.SELLER || !user.seller) redirect(routes.sell);
  if (user.seller.status !== SELLER.ACTIVE) redirect("/");
  return { user, seller: user.seller };
}

export async function audit(actorId: string | null, action: string, target: string, detail?: string) {
  await db.auditLog.create({ data: { actorId, action, target, detail } });
}
