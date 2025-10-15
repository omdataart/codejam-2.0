// src/lib/currency.js
const DEFAULT_BASE = "INR";

const FALLBACK_RATES = {
  base: DEFAULT_BASE,
  asOf: "static",
  rates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.75,
    AUD: 0.018,
    CAD: 0.017,
    CHF: 0.011,
    SGD: 0.016,
    AED: 0.044,
  },
};

export function convertCurrency(amount, from, to, fx) {
  const n = Number(amount ?? 0);
  if (!from || !to || from === to) return n;
  const base = fx?.base ?? DEFAULT_BASE;
  const rates = fx?.rates ?? FALLBACK_RATES.rates;
  const rFrom = from === base ? 1 : rates[from];
  const rTo = to === base ? 1 : rates[to];
  if (!rFrom || !rTo) return n;
  const inBase = from === base ? n : n / rFrom;
  return to === base ? inBase : inBase * rTo;
}

export function formatCurrency(amount, code = "INR", minFrac = 0, maxFrac = 2) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    }).format(Number(amount) || 0);
  } catch {
    const v = (Number(amount) || 0).toFixed(
      Math.max(minFrac, Math.min(maxFrac, 3))
    );
    return `${code} ${v}`;
  }
}
