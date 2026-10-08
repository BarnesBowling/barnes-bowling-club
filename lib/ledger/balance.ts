// Single source of truth for member balance calculation.
// Rule: balance = sum(debit amounts) − sum(credit amounts).
// Positive = member owes money. Negative = member in credit. Zero = settled.
// Never use the category column for balance maths.

export type LedgerEntry = { amount: number | string; type: string };

export function calcBalance(entries: LedgerEntry[]): number {
  return entries.reduce(
    (sum, e) => sum + (e.type === 'credit' ? -Number(e.amount) : Number(e.amount)),
    0,
  );
}

export function formatBalance(balance: number): string {
  if (Math.abs(balance) < 0.005) return 'Settled';
  if (balance > 0) return `Owes £${balance.toFixed(2)}`;
  return `£${Math.abs(balance).toFixed(2)} in credit`;
}
