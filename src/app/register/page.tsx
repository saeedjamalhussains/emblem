import { register } from "@/app/actions/auth";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <PageTitle title="Create an account" sub="Customer accounts are open to everyone. Sellers join by invitation." />
      <ActionForm action={register} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={8} required className="input" autoComplete="new-password" />
        </div>
        <Submit className="btn-primary w-full">Create account</Submit>
      </ActionForm>
    </div>
  );
}
