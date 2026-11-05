import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { reissueInvitation, reviewApplication } from "@/app/actions/admin";
import { PageTitle, StatusPill } from "@/components/cards";
import { routes } from "@/lib/routes";
import { APPLICATION } from "@/config/status";

export default async function Applications() {
  const apps = await db.sellerApplication.findMany({
    include: { invitation: true, seller: true },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });
  const open = apps.filter((a) => a.status === APPLICATION.SUBMITTED || a.status === APPLICATION.NEEDS_INFO);
  const closed = apps.filter((a) => !open.includes(a));

  return (
    <>
      <PageTitle title="Seller applications" sub="Approving an application issues a single-use invitation link." />
      <div className="space-y-4">
        {open.map((a) => (
          <section key={a.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="">{a.businessName}</span>
                <span className="text-[13px] text-muted"> · {a.applicantName} · {a.email}</span>
              </div>
              <StatusPill status={a.status} />
            </div>
            <p className="mt-3 text-[13px]">{a.description}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-[11px] text-muted sm:grid-cols-2">
              <div>Categories: <span className="text-fg">{a.categories}</span></div>
              <div>Submitted: <span className="text-fg">{formatDate(a.createdAt)}</span></div>
              <div>GSTIN: <span className="font-mono text-fg">{a.gstin ?? "—"}</span></div>
              <div>PAN: <span className="font-mono text-fg">{a.pan ?? "—"}</span></div>
              {a.portfolioUrl && (
                <div>Portfolio: <a href={a.portfolioUrl} target="_blank" rel="noreferrer noopener" className="text-fg underline">{a.portfolioUrl}</a></div>
              )}
              {a.authorizationNotes && <div className="sm:col-span-2">Authorisation: <span className="text-fg">{a.authorizationNotes}</span></div>}
              {a.adminNote && <div className="sm:col-span-2 text-warn">Previous note: {a.adminNote}</div>}
            </dl>
            <form className="mt-4 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={a.id} />
              <input name="note" placeholder="Note to applicant (optional)" className="input max-w-sm flex-1 py-1.5" />
              <button formAction={reviewApplication.bind(null, APPLICATION.APPROVED)} className="btn-primary py-1.5">Approve &amp; invite</button>
              <button formAction={reviewApplication.bind(null, APPLICATION.NEEDS_INFO)} className="btn-ghost py-1.5">Request info</button>
              <button formAction={reviewApplication.bind(null, APPLICATION.REJECTED)} className="btn-danger py-1.5">Reject</button>
            </form>
          </section>
        ))}
        {open.length === 0 && <p className="text-[13px] text-muted">No applications waiting for review.</p>}
      </div>

      <h2 className="mt-10 mb-3">Decided</h2>
      <div className="card divide-y divide-line text-[13px]">
        {closed.map((a) => {
          const inv = a.invitation;
          const expired = inv && !inv.usedAt && inv.expiresAt < new Date();
          return (
            <div key={a.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="">{a.businessName}</span>
              <StatusPill status={a.status} />
              <span className="flex-1 text-[11px] text-muted">{a.email}</span>
              {a.seller && <span className="text-[11px] text-ok">Seller active</span>}
              {inv && !inv.usedAt && !expired && (
                <span className="text-[11px] text-muted">
                  Invitation link (email delivery not wired up yet):{" "}
                  <a href={routes.invite(inv.token)} className="font-mono text-fg underline">/invite/{inv.token.slice(0, 10)}…</a>
                </span>
              )}
              {expired && (
                <form action={reissueInvitation}>
                  <input type="hidden" name="applicationId" value={a.id} />
                  <button className="btn-ghost py-1 text-[11px]">Invitation expired — reissue</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
