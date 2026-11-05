import { db } from "@/lib/db";
import { accountBalances } from "@/lib/orders";
import { formatDate, formatPaise } from "@/lib/format";
import { PageTitle } from "@/components/cards";

export default async function Ledger() {
  const [balances, transactions, sellers] = await Promise.all([
    accountBalances(),
    db.ledgerTransaction.findMany({ include: { entries: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.seller.findMany({ select: { id: true, storeName: true } }),
  ]);
  const sellerName = new Map(sellers.map((s) => [s.id, s.storeName]));
  const label = (account: string) => account.replace(/^seller:([^:]+):/, (_, id) => `seller:${sellerName.get(id) ?? id}:`);
  const totalDebit = balances.reduce((s, b) => s + b.debitPaise, 0);
  const totalCredit = balances.reduce((s, b) => s + b.creditPaise, 0);
  const balanced = totalDebit === totalCredit;

  return (
    <>
      <PageTitle title="Ledger" sub="Double-entry: every transaction's debits equal its credits." />
      <div className={`mb-6 border p-3 text-[13px] ${balanced ? "border-ok/40 text-ok" : "border-bad/40 text-bad"}`}>
        Trial balance {balanced ? "balances" : "DOES NOT balance"}: debits {formatPaise(totalDebit)} · credits {formatPaise(totalCredit)}
      </div>

      <h2 className="mb-3">Account balances</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] text-muted uppercase">
            <tr className="border-b border-line"><th className="p-3">Account</th><th className="p-3 text-right">Debits</th><th className="p-3 text-right">Credits</th><th className="p-3 text-right">Net</th></tr>
          </thead>
          <tbody className="divide-y divide-line font-mono text-[11px]">
            {balances.map((b) => (
              <tr key={b.account}>
                <td className="p-3">{label(b.account)}</td>
                <td className="p-3 text-right">{formatPaise(b.debitPaise)}</td>
                <td className="p-3 text-right">{formatPaise(b.creditPaise)}</td>
                <td className="p-3 text-right">{formatPaise(Math.abs(b.debitPaise - b.creditPaise))} {b.debitPaise >= b.creditPaise ? "Dr" : "Cr"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {balances.length === 0 && <p className="p-6 text-[13px] text-muted">No ledger activity yet. Place a test order to see entries.</p>}
      </div>

      <h2 className="mt-10 mb-3">Recent transactions</h2>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex flex-wrap justify-between gap-2 text-[13px]">
              <span><span className="text-fg">{t.kind}</span> · {t.memo}</span>
              <span className="text-[11px] text-muted">{formatDate(t.createdAt)} · ref {t.reference.slice(-8)}</span>
            </div>
            <table className="mt-2 w-full font-mono text-[11px]">
              <tbody>
                {t.entries.map((e) => (
                  <tr key={e.id}>
                    <td className={`py-0.5 ${e.creditPaise ? "pl-6" : ""}`}>{label(e.account)}</td>
                    <td className="w-28 text-right">{e.debitPaise ? formatPaise(e.debitPaise) : ""}</td>
                    <td className="w-28 text-right">{e.creditPaise ? formatPaise(e.creditPaise) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
