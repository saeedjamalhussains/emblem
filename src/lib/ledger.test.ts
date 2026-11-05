import { test } from "node:test";
import assert from "node:assert/strict";
import { assertBalanced, customerPaymentEntries, deliveryEntries, splitReserve } from "./ledger";

const sum = (entries: { debitPaise?: number; creditPaise?: number }[], k: "debitPaise" | "creditPaise") =>
  entries.reduce((s, e) => s + (e[k] ?? 0), 0);

test("customer payment across sellers balances", () => {
  const entries = customerPaymentEntries(4_798_00, [
    { sellerId: "a", amountPaise: 2_499_00 },
    { sellerId: "b", amountPaise: 2_299_00 },
  ]);
  assert.doesNotThrow(() => assertBalanced(entries));
});

test("delivery holds 20% in reserve and never loses a paisa to rounding", () => {
  for (const amount of [1, 3, 99, 1_299_00, 2_499_99, 7_777_77]) {
    const { reservePaise, payablePaise } = splitReserve(amount);
    assert.equal(reservePaise + payablePaise, amount);
    const entries = deliveryEntries("s", amount);
    assert.equal(sum(entries, "debitPaise"), sum(entries, "creditPaise"));
  }
  assert.deepEqual(splitReserve(10_000_00), { reservePaise: 2_000_00, payablePaise: 8_000_00 });
});

test("unbalanced, negative and fractional entries are rejected", () => {
  assert.throws(() => assertBalanced([{ account: "x", debitPaise: 100 }, { account: "y", creditPaise: 99 }]), /Unbalanced/);
  assert.throws(() => assertBalanced([{ account: "x", debitPaise: -1 }, { account: "y", creditPaise: -1 }]), /non-negative/);
  assert.throws(() => assertBalanced([{ account: "x", debitPaise: 1.5 }, { account: "y", creditPaise: 1.5 }]), /integers/);
  assert.throws(() => assertBalanced([]), /Empty/);
});
