import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { countriesQuery } from "@/lib/juju-queries";
import { fmtMetric } from "@/lib/juju-format";
import { METRICS, SUBREGIONS, TIERS, TIER_LABEL, type MetricKey } from "@/lib/juju-types";
import { FilterChips } from "@/components/juju/FilterChips";
import { RecordRow } from "@/components/juju/RecordRow";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "All 54 African Countries, Ranked — Juju Africa" },
      {
        name: "description",
        content:
          "Search all 54 sovereign African nations and rank them on GDP, population, life expectancy, minimum wage, literacy, poverty or youth share.",
      },
      { property: "og:title", content: "All 54 African Countries, Ranked — Juju Africa" },
      {
        property: "og:description",
        content: "Filter by tier and sub-region, then rank every nation on any standardized indicator.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: CountriesScreen,
});

const TIER_DOT: Record<string, string> = {
  elite: "text-elite",
  standard: "text-standard",
  emerging: "text-emerging",
};

function CountriesScreen() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [term, setTerm] = useState("");
  const [tier, setTier] = useState("all");
  const [subregion, setSubregion] = useState("all");
  const [metric, setMetric] = useState<MetricKey>("gdp_nominal_usd");

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return countries
      .filter((c) => (tier === "all" || c.tier === tier) && (subregion === "all" || c.subregion === subregion))
      .filter(
        (c) =>
          q.length === 0 ||
          c.common_name.toLowerCase().includes(q) ||
          c.official_name.toLowerCase().includes(q) ||
          (c.capital_city ?? "").toLowerCase().includes(q) ||
          (c.iso3 ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => Number(b[metric] ?? -Infinity) - Number(a[metric] ?? -Infinity));
  }, [countries, term, tier, subregion, metric]);

  const active = METRICS.find((m) => m.key === metric);

  return (
    <div className="pb-8">
      <div className="sticky top-0 z-10 border-b border-hairline bg-background/97 px-4 pt-4 pb-3 backdrop-blur">
        <label className="flex items-center gap-2 border border-hairline bg-card px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search nation, capital, ISO…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <FilterChips
          className="mt-2.5"
          chips={[
            { value: "all", label: "All tiers" },
            ...TIERS.map((t) => ({ value: t, label: TIER_LABEL[t], dotClass: TIER_DOT[t] })),
          ]}
          active={tier}
          onChange={setTier}
        />
        <FilterChips
          className="mt-2"
          chips={[
            { value: "all", label: "All Africa" },
            ...SUBREGIONS.map((s) => ({ value: s, label: s.replace(" Africa", "") })),
          ]}
          active={subregion}
          onChange={setSubregion}
        />
        <FilterChips
          className="mt-2"
          chips={METRICS.map((m) => ({ value: m.key, label: m.label }))}
          active={metric}
          onChange={(v) => setMetric(v as MetricKey)}
        />
      </div>

      <div className="flex items-baseline justify-between px-4 py-2.5">
        <p className="eyebrow">{rows.length} records</p>
        <p className="eyebrow">ranked by {active?.label}</p>
      </div>

      <div>
        {rows.map((country, i) => (
          <RecordRow
            key={country.slug}
            dotClass={TIER_DOT[country.tier]}
            title={`${country.flag_emoji ?? ""} ${country.common_name}`}
            meta={`${String(i + 1).padStart(2, "0")} · ${country.subregion} · ${country.capital_city ?? "—"}`}
            value={fmtMetric(metric, country[metric])}
            valueCaption={TIER_LABEL[country.tier]}
            to="/country/$slug"
            params={{ slug: country.slug }}
          />
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No nation matches that filter.</p>
        )}
      </div>
    </div>
  );
}
