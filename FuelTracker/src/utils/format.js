// src/utils/format.js
import { useSettings } from "../store/settingsStore";
import { convertCurrency, formatCurrency } from "../lib/currency";

// Backward compatible signature: money(n, currencyOrOpts)
export const money = (n, currencyOrOpts) => {
  const s = useSettings.getState();
  const preferred = s.currency || "INR";
  const fx = s.fx;

  // Support both old string param and new options object
  const to =
    typeof currencyOrOpts === "string"
      ? currencyOrOpts
      : currencyOrOpts?.to ?? preferred;

  const from =
    typeof currencyOrOpts === "object" && currencyOrOpts?.from
      ? currencyOrOpts.from
      : fx?.base ?? "INR";

  const minFrac =
    typeof currencyOrOpts === "object" && currencyOrOpts?.minFrac != null
      ? currencyOrOpts.minFrac
      : 0;

  const maxFrac =
    typeof currencyOrOpts === "object" && currencyOrOpts?.maxFrac != null
      ? currencyOrOpts.maxFrac
      : s.priceDecimals ?? 2;

  const converted = convertCurrency(n ?? 0, from, to, fx);
  return formatCurrency(converted, to, minFrac, maxFrac);
};

export const num = (n, d = 2) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: d });

export const round = (n, d = 2) => Math.round((n ?? 0) * 10 ** d) / 10 ** d;
