import { db } from "@/lib/db";
import { acceptInvitation } from "@/app/actions/admission";
import { ActionForm, Submit } from "@/components/action-form";
import { PageTitle } from "@/components/cards";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.invitation.findUnique({ where: { token }, include: { application: true } });
  const valid = invitation && !invitation.usedAt && invitation.expiresAt > new Date();

  if (!valid) {
    return (
      <div className="mx-auto max-w-md">
        <PageTitle title="Invitation unavailable" sub="This link is invalid, has already been used or has expired." />
      </div>
    );
  }
  const hasAccount = !!(await db.user.findUnique({ where: { email: invitation.email } }));

  return (
    <div className="mx-auto max-w-md">
      <PageTitle title="You're invited to sell" sub={`Your application for ${invitation.application.businessName} was approved.`} />
      <ActionForm action={acceptInvitation} className="card space-y-4 p-6">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label">Email</label>
          <div className="input text-muted">{invitation.email}</div>
        </div>
        <div>
          <label className="label" htmlFor="storeName">Store name</label>
          <input id="storeName" name="storeName" defaultValue={invitation.application.businessName} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">{hasAccount ? "Your existing account password" : "Choose a password"}</label>
          <input id="password" name="password" type="password" required minLength={hasAccount ? 1 : 8} className="input" autoComplete={hasAccount ? "current-password" : "new-password"} />
        </div>
        <p className="text-[11px] text-muted">You&apos;ll start on the lowest subscription tier. Billing begins on activation.</p>
        <Submit className="btn-primary w-full">Activate seller account</Submit>
      </ActionForm>
    </div>
  );
}
