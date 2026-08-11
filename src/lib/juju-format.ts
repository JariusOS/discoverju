import type { MetricKey } from "./juju-types";

const NBSP_DASH = "—";

export function fmtNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  return new Intl.NumberFormat("en-US").format(value);
}

export function fmtCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function fmtUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  if (Math.abs(value) >= 1_000_000) {
    return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`;
  }
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
}

export function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  return `${value}%`;
}

export function fmtYears(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  return `${value} yrs`;
}

export function fmtRatio(value: number | null | undefined): string {
  if (value === null || value === undefined) return NBSP_DASH;
  return `${value.toFixed(2)} : 1`;
}

export function fmtMetric(key: MetricKey, value: number | null | undefined): string {
  switch (key) {
    case "gdp_nominal_usd":
    case "gdp_per_capita_usd":
    case "minimum_wage_monthly_usd":
      return fmtUsd(value);
    case "total_population":
      return fmtCompact(value);
    case "life_expectancy_years":
      return fmtYears(value);
    default:
      return fmtPct(value);
  }
}

export const EMPTY = NBSP_DASH;
