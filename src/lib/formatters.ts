const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatCurrencyFromCents(cents: number | null | undefined) {
  if (cents == null) return "-";
  return currencyFormatter.format(cents / 100);
}

export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-US", options).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}
