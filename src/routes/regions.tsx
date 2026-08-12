import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { countriesQuery } from "@/lib/juju-queries";
import { fmtCompact, fmtUsd } from "@/lib/juju-format";
import { SUBREGIONS, type Subregion } from "@/lib/juju-types";
import { FilterChips } from "@/components/juju/FilterChips";

export const Route = createFileRoute("/regions")({
  head: () => ({
    meta: [
      { title: "African Sub-Regions Ranked — Juju Africa" },
      {
        name: "description",
        content:
          "Compare North, West, Central, East and Southern Africa on GDP, population, GDP per capita and nation count, with each sub-region ranked as a share of the continent.",
      },
      { property: "og:title", content: "African Sub-Regions Ranked — Juju Africa" },
      {
        property: "og:description",
        content: "Five sub-regions, ranked bars: economic weight, population and per-capita output.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: RegionsScreen,
});

type Basis = "gdp" | "population" | "per_capita" | "count";

const BASIS = [
  { value: "gdp", label: "GDP" },
  { value: "population", label: "Population" },
  { value: "per_capita", label: "Per capita" },
  { value: "count", label: "Nations" },
];

const BAR_CLASS: Record<Subregion, string> = {
  "North Africa": "bg-signal-amber",
  "West Africa": "bg-signal-cyan",
  "Central Africa": "bg-signal-violet",
  "East Africa": "bg-signal-green",
  "Southern Africa": "bg-signal-magenta",
};




function RegionsScreen() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [basis, setBasis] = useState<Basis>("gdp");

  const rows = useMemo(() => {
    const list = SUBREGIONS.map((region) => {
      const members = countries.filter((c) => c.subregion === region);
      const gdp = members.reduce((s, c) => s + Number(c.gdp_nominal_usd ?? 0), 0);
      const pop = members.reduce((s, c) => s + Number(c.total_population ?? 0), 0);
      const elite = members.filter((c) => c.tier === "elite").length;
      const value =
        basis === "gdp" ? gdp : basis === "population" ? pop : basis === "count" ? members.length : pop ? gdp / pop : 0;
      return { region, members: members.length, gdp, pop, elite, value };
    });
    const max = Math.max(...list.map((r) => r.value), 1);
    const total = list.reduce((s, r) => s + r.value, 0) || 1;
    return list
      .map((r) => ({ ...r, pctOfMax: r.value / max, share: (r.value / total) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [countries, basis]);

  const format = (value: number) => {
    if (basis === "count") return String(value);
    if (basis === "population") return fmtCompact(value);
    return fmtUsd(value);
  };

  return (
    <div className="pb-8">
      <div className="flex items-baseline justify-between px-4 pt-4">
        <h1 className="text-base text-foreground">By sub-region</h1>
        <p className="text-[11px] text-muted-foreground">tap a basis</p>
      </div>

      <div className="px-4 pt-3">
        <FilterChips chips={BASIS} active={basis} onChange={(v) => setBasis(v as Basis)} />
      </div>

      <div className="mt-5">
        {rows.map((row) => (
          <div key={row.region} className="border-b border-border/70 px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-foreground">{row.region}</p>
              <p className="numeral text-sm text-foreground">{format(row.value)}</p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${BAR_CLASS[row.region]}`}
                style={{ width: `${Math.max(row.pctOfMax * 100, 1.5)}%` }}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 text-[11px] text-muted-foreground">
              <p className="numeral">
                {row.members} nations · {row.elite} elite
              </p>
              <p className="numeral">
                {row.share.toFixed(1)}% of continent · {fmtCompact(row.pop)} people
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="px-4 pt-4 text-[11px] leading-relaxed text-muted-foreground">
        Sub-region membership follows the United Nations and African Union classification. Shares are computed
        from the indicator baselines held in this atlas, not from a single published source.
      </p>
    </div>
  );
}
