import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { countriesQuery } from "@/lib/juju-queries";
import { TierBadge } from "@/components/juju/TierBadge";
import { fmtMetric } from "@/lib/juju-format";
import { METRICS, SUBREGIONS, TIERS, TIER_LABEL, type MetricKey } from "@/lib/juju-types";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search African Countries — Juju Africa" },
      {
        name: "description",
        content:
          "Search and rank all 54 African nations by GDP, population, literacy, minimum wage, life expectancy, poverty and youth share.",
      },
      { property: "og:title", content: "Search African Countries — Juju Africa" },
      {
        property: "og:description",
        content: "Filter by sub-region and tier, then rank nations on any of 13 standardized indicators.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: SearchPage,
});

function SearchPage() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [term, setTerm] = useState("");
  const [subregion, setSubregion] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [metric, setMetric] = useState<MetricKey>("gdp_nominal_usd");
  const [ascending, setAscending] = useState(false);

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return countries
      .filter((c) => {
        if (subregion !== "all" && c.subregion !== subregion) return false;
        if (tier !== "all" && c.tier !== tier) return false;
        if (!needle) return true;
        return [c.common_name, c.official_name, c.capital_city, c.largest_city, c.iso3]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const av = a[metric] === null || a[metric] === undefined ? null : Number(a[metric]);
        const bv = b[metric] === null || b[metric] === undefined ? null : Number(b[metric]);
        if (av === null && bv === null) return a.common_name.localeCompare(b.common_name);
        if (av === null) return 1;
        if (bv === null) return -1;
        return ascending ? av - bv : bv - av;
      });
  }, [countries, term, subregion, tier, metric, ascending]);

  const selectClass =
    "rounded-sm border border-hairline bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Mode 01 · Search</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Find and rank any African nation</h1>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Country, capital, city or ISO code…"
            aria-label="Search countries"
            className="rounded-sm border border-hairline bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none lg:col-span-2"
          />
          <select
            value={subregion}
            onChange={(e) => setSubregion(e.target.value)}
            aria-label="Sub-region"
            className={selectClass}
          >
            <option value="all">All sub-regions</option>
            {SUBREGIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier" className={selectClass}>
            <option value="all">All tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              aria-label="Rank by"
              className={`${selectClass} flex-1`}
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAscending((v) => !v)}
              aria-label="Toggle sort direction"
              className="rounded-sm border border-hairline bg-card px-3 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {ascending ? "ASC" : "DESC"}
            </button>
          </div>
        </div>

        <p className="eyebrow mt-6">{results.length} nations</p>

        <div className="mt-3 overflow-x-auto rounded-sm border border-hairline">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="eyebrow px-4 py-3 font-normal">#</th>
                <th className="eyebrow px-4 py-3 font-normal">Nation</th>
                <th className="eyebrow px-4 py-3 font-normal">Sub-region</th>
                <th className="eyebrow px-4 py-3 font-normal">Tier</th>
                <th className="eyebrow px-4 py-3 font-normal">Capital</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">
                  {METRICS.find((m) => m.key === metric)?.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((country, index) => (
                <tr key={country.slug} className="border-b border-border/60 last:border-0 hover:bg-secondary/60">
                  <td className="numeral px-4 py-3 text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/country/$slug"
                      params={{ slug: country.slug }}
                      className="text-foreground hover:text-primary"
                    >
                      {country.flag_emoji} {country.common_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{country.subregion}</td>
                  <td className="px-4 py-3">
                    <TierBadge tier={country.tier} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{country.capital_city ?? "—"}</td>
                  <td className="numeral px-4 py-3 text-right text-foreground">
                    {fmtMetric(metric, country[metric] === null ? null : Number(country[metric]))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No nations match those filters.</p>
        )}
      </div>
    </div>
  );
}
