import Link from "next/link";
import { login } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";
import { routes } from "@/lib/routes";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <PageTitle title="Sign in" />
      <ActionForm action={login} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        <Submit className="btn-primary w-full">Sign in</Submit>
      </ActionForm>
      <p className="mt-6 text-[13px] text-muted">
        New here?{" "}
        <Link href={routes.register(next)} className="text-fg hover:opacity-60">
          Create a customer account
        </Link>
      </p>
      <p className="mt-2 text-[13px] text-muted">
        Want to sell?{" "}
        <Link href={routes.sell} className="text-fg hover:opacity-60">
          Apply to become a seller
        </Link>
      </p>
    </div>
  );
}
