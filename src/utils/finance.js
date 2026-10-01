/** Vehicle finance helpers. Figures are indicative; approval and final rates come from the lender. */

export const FINANCE_DEFAULTS = {
  depositPct: 20,
  months: 48,
  annualRate: 14.5, // % per year, USD vehicle finance
  terms: [12, 24, 36, 48, 60, 72],
};

/** Standard amortised monthly payment. */
export function monthlyPayment(principal, annualRatePct, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Cheapest monthly figure for a car using the default terms, for "from $X/mo" badges. */
export function fromMonthly(price) {
  const principal = price * (1 - FINANCE_DEFAULTS.depositPct / 100);
  return monthlyPayment(principal, FINANCE_DEFAULTS.annualRate, Math.max(...FINANCE_DEFAULTS.terms));
}

export const usd = (n) => `$${Math.round(n).toLocaleString()}`;
