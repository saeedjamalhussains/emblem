import { db } from "@/lib/db";
import { identityTypeLabel } from "@/config/rules";
import { formatDate } from "@/lib/format";
import { reviewAuthorization } from "@/app/actions/admin";
import { Emblem, PageTitle } from "@/components/cards";
import { AUTHORIZATION } from "@/config/status";

export default async function Authorizations() {
  const pending = await db.identityAuthorization.findMany({
    where: { status: AUTHORIZATION.PENDING },
    include: { seller: true, identity: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <>
      <PageTitle title="Identity authorisations" sub="Verify a seller's right to represent a brand, team, creator or community." />
      <div className="space-y-4">
        {pending.map((a) => (
          <section key={a.id} className="card flex items-start gap-4 p-5">
            <Emblem name={a.identity.name} color={a.identity.color} size={48} />
            <div className="flex-1">
              <div>
                <span className="">{a.seller.storeName}</span>
                <span className="text-muted"> wants to sell </span>
                <span className="">{a.identity.name}</span>
                <span className="text-[11px] text-muted"> ({identityTypeLabel(a.identity.type)})</span>
              </div>
              <p className="mt-2 text-[13px]">Evidence: {a.evidence}</p>
              <p className="text-[11px] text-muted">Requested {formatDate(a.createdAt)}</p>
              <form className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={a.id} />
                <input name="note" placeholder="Note (optional)" className="input max-w-sm flex-1 py-1.5" />
                <button formAction={reviewAuthorization.bind(null, AUTHORIZATION.APPROVED)} className="btn-primary py-1.5">Verify</button>
                <button formAction={reviewAuthorization.bind(null, AUTHORIZATION.REJECTED)} className="btn-danger py-1.5">Reject</button>
              </form>
            </div>
          </section>
        ))}
        {pending.length === 0 && <p className="text-[13px] text-muted">No authorisation requests waiting.</p>}
      </div>
    </>
  );
}
