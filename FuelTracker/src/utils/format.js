// export const money = (n, currency = "INR") =>
//   new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
//     n ?? 0
//   );

// export const num = (n, d = 2) =>
//   Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: d });

// export const round = (n, d = 2) => Math.round((n ?? 0) * 10 ** d) / 10 ** d;

export const money = (n, currency = "INR") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    n ?? 0
  );

export const num = (n, d = 2) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: d });

export const round = (n, d = 2) => Math.round((n ?? 0) * 10 ** d) / 10 ** d;
