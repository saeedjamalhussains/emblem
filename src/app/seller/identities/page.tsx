import { db } from "@/lib/db";
import { requireSeller } from "@/lib/auth";
import { identityTypeLabel } from "@/config/rules";
import { requestAuthorization } from "@/app/actions/seller";
import { ActionForm, Submit } from "@/components/action-form";
import { Emblem, PageTitle, StatusPill } from "@/components/cards";
import { AUTHORIZATION } from "@/config/status";

export default async function SellerIdentities() {
  const { seller } = await requireSeller();
  const [mine, identities] = await Promise.all([
    db.identityAuthorization.findMany({ where: { sellerId: seller.id }, include: { identity: true }, orderBy: { createdAt: "desc" } }),
    db.identity.findMany({ orderBy: { name: "asc" } }),
  ]);
  const blocked = new Set(mine.filter((a) => a.status !== AUTHORIZATION.REJECTED).map((a) => a.identityId));
  const requestable = identities.filter((i) => !blocked.has(i.id));

  return (
    <>
      <PageTitle title="Identities" sub="You can only sell merchandise for identities you're verified to represent." />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card divide-y divide-line">
          {mine.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-4">
              <Emblem name={a.identity.name} color={a.identity.color} size={40} />
              <div className="flex-1">
                <div className="">{a.identity.name}</div>
                <div className="text-[11px] text-muted">{identityTypeLabel(a.identity.type)} · {a.evidence}</div>
                {a.adminNote && <div className="text-[11px] text-warn">Admin: {a.adminNote}</div>}
              </div>
              <StatusPill status={a.status} />
            </div>
          ))}
          {mine.length === 0 && <p className="p-6 text-[13px] text-muted">No authorisations yet.</p>}
        </div>
        <ActionForm action={requestAuthorization} className="card h-fit space-y-4 p-5">
          <h2 className="">Request authorisation</h2>
          <div>
            <label className="label" htmlFor="identityId">Identity</label>
            <select id="identityId" name="identityId" className="input">
              {requestable.map((i) => <option key={i.id} value={i.id}>{i.name} ({identityTypeLabel(i.type)})</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="evidence">Evidence</label>
            <textarea id="evidence" name="evidence" rows={3} required className="input" placeholder="Licence number, agreement date, ownership proof…" />
          </div>
          <p className="text-[11px] text-muted">Document uploads arrive in a later milestone.</p>
          <Submit className="btn-primary w-full">Send for review</Submit>
        </ActionForm>
      </div>
    </>
  );
}
