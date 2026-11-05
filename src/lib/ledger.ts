import type { Prisma } from "@prisma/client";
import { GUARANTEE_RESERVE_RATE } from "@/config/rules";

type Tx = Prisma.TransactionClient;

export type Entry = { account: string; debitPaise?: number; creditPaise?: number };

export const accounts = {
  gatewayClearing: "gateway:clearing",
  sellerPending: (sellerId: string) => `seller:${sellerId}:pending`,
  sellerPayable: (sellerId: string) => `seller:${sellerId}:payable`,
  sellerReserve: (sellerId: string) => `seller:${sellerId}:reserve`,
};

export function assertBalanced(entries: Entry[]) {
  let debit = 0;
  let credit = 0;
  for (const e of entries) {
    const d = e.debitPaise ?? 0;
    const c = e.creditPaise ?? 0;
    if (!Number.isInteger(d) || !Number.isInteger(c) || d < 0 || c < 0) {
      throw new Error(`Ledger amounts must be non-negative integers (account ${e.account})`);
    }
    if (d > 0 && c > 0) throw new Error(`Entry for ${e.account} cannot be both debit and credit`);
    debit += d;
    credit += c;
  }
  if (debit !== credit) throw new Error(`Unbalanced ledger transaction: debit ${debit} ≠ credit ${credit}`);
  if (debit === 0) throw new Error("Empty ledger transaction");
}

export async function postTransaction(
  tx: Tx,
  input: { kind: string; reference: string; memo: string; entries: Entry[] },
) {
  const entries = input.entries.filter((e) => (e.debitPaise ?? 0) > 0 || (e.creditPaise ?? 0) > 0);
  assertBalanced(entries);
  return tx.ledgerTransaction.create({
    data: {
      kind: input.kind,
      reference: input.reference,
      memo: input.memo,
      entries: {
        create: entries.map((e) => ({
          account: e.account,
          debitPaise: e.debitPaise ?? 0,
          creditPaise: e.creditPaise ?? 0,
        })),
      },
    },
  });
}

/** Customer paid: money sits at the gateway, owed to each seller pending delivery. */
export function customerPaymentEntries(totalPaise: number, perSeller: { sellerId: string; amountPaise: number }[]): Entry[] {
  return [
    { account: accounts.gatewayClearing, debitPaise: totalPaise },
    ...perSeller.map((s) => ({ account: accounts.sellerPending(s.sellerId), creditPaise: s.amountPaise })),
  ];
}

/** Delivered: 80% becomes payable to the seller, 20% is held as the guarantee reserve. */
export function splitReserve(amountPaise: number) {
  const reservePaise = Math.round(amountPaise * GUARANTEE_RESERVE_RATE);
  return { reservePaise, payablePaise: amountPaise - reservePaise };
}

export function deliveryEntries(sellerId: string, amountPaise: number): Entry[] {
  const { reservePaise, payablePaise } = splitReserve(amountPaise);
  return [
    { account: accounts.sellerPending(sellerId), debitPaise: amountPaise },
    { account: accounts.sellerPayable(sellerId), creditPaise: payablePaise },
    { account: accounts.sellerReserve(sellerId), creditPaise: reservePaise },
  ];
}
