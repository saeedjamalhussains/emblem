import "server-only";
import { db } from "./db";
import { deliveryEntries, postTransaction } from "./ledger";
import { ORDER } from "@/config/status";

/**
 * Marks a dispatched seller order as delivered and moves its proceeds from
 * pending into payable (80%) and the guarantee reserve (20%).
 * Delivery is confirmed by the courier (simulated by an admin) or the customer — never the seller.
 */
export async function markDelivered(sellerOrderId: string, confirmedBy: string) {
  await db.$transaction(async (tx) => {
    const updated = await tx.sellerOrder.updateMany({
      where: { id: sellerOrderId, status: ORDER.DISPATCHED },
      data: { status: ORDER.DELIVERED, deliveredAt: new Date() },
    });
    if (updated.count === 0) throw new Error("Only dispatched orders can be marked delivered.");
    const so = await tx.sellerOrder.findUniqueOrThrow({ where: { id: sellerOrderId } });
    await postTransaction(tx, {
      kind: "DELIVERY_SPLIT",
      reference: so.id,
      memo: `Delivered (confirmed by ${confirmedBy}); 20% held as guarantee reserve`,
      entries: deliveryEntries(so.sellerId, so.subtotalPaise),
    });
  });
}

/** Net balance (credits − debits) per account, optionally filtered by prefix. */
export async function accountBalances(prefix?: string) {
  const rows = await db.ledgerEntry.groupBy({
    by: ["account"],
    where: prefix ? { account: { startsWith: prefix } } : undefined,
    _sum: { debitPaise: true, creditPaise: true },
  });
  return rows.map((r) => ({
    account: r.account,
    debitPaise: r._sum.debitPaise ?? 0,
    creditPaise: r._sum.creditPaise ?? 0,
  }));
}
