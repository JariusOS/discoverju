import { createFileRoute } from "@tanstack/react-router";
import { INDICATOR_DEFINITIONS, TIER_LABEL, TIERS, METRICS } from "@/lib/juju-types";

export const Route = createFileRoute("/intel")({
  head: () => ({
    meta: [
      { title: "Methodology & Indicator Definitions — Juju Africa" },
      {
        name: "description",
        content:
          "How Juju Africa is built: the 13-parameter country template, indicator definitions, the Elite/Standard/Emerging tier method, data vintages and blank-field policy.",
      },
      { property: "og:title", content: "Methodology & Indicator Definitions — Juju Africa" },
      {
        property: "og:description",
        content: "Indicator definitions, tier methodology and data vintages behind the atlas.",
      },
    ],
  }),
  component: IntelScreen,
});

const TIER_NOTE: Record<string, string> = {
  elite: "Roughly 12.5% of nations. Largest economies, strategic geography and decisive weight in global export supply chains.",
  standard: "Roughly 50% of nations. Established export bases with meaningful regional influence.",
  emerging: "Roughly 35% of nations. Smaller or earlier-stage export economies, often single-commodity dependent.",
};

const LABELS: { key: string; label: string }[] = [
  { key: "official_name", label: "Official country name" },
  { key: "subregion", label: "Geographic sub-region" },
  { key: "subdivisions", label: "Primary political subdivisions" },
  { key: "total_population", label: "Total population" },
  { key: "capital", label: "Capital city & population" },
  { key: "largest_city", label: "Most populated city" },
  { key: "gdp", label: "GDP & per capita" },
  { key: "minimum_wage", label: "Monthly statutory minimum wage" },
  { key: "life_expectancy", label: "Life expectancy at birth" },
  { key: "youth", label: "Youth demographic profile" },
  { key: "poverty", label: "Poverty headcount ratio" },
  { key: "literacy", label: "Adult literacy" },
  { key: "sex_ratio", label: "Sex ratio" },
  { key: "structural", label: "Aligned structural parameter" },
];

function IntelScreen() {
  return (
    <div className="px-4 pt-4 pb-10">
      <h1 className="text-base text-foreground">Intel</h1>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Template architecture, tier method and data vintages.
      </p>

      <section className="mt-6">
        <p className="eyebrow">Tier classification</p>
        <div className="mt-2 divide-y divide-border/70 border-y border-hairline">
          {TIERS.map((tier) => (
            <div key={tier} className="py-3">
              <p className="text-sm text-foreground">{TIER_LABEL[tier]}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{TIER_NOTE[tier]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="eyebrow">13-parameter country template</p>
        <div className="mt-2 divide-y divide-border/70 border-y border-hairline">
          {LABELS.map((row) => (
            <div key={row.key} className="py-3">
              <p className="text-sm text-foreground">{row.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {INDICATOR_DEFINITIONS[row.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="eyebrow">Data vintages</p>
        <div className="mt-2 divide-y divide-border/70 border-y border-hairline">
          {METRICS.map((m) => (
            <div key={m.key} className="flex items-baseline justify-between gap-4 py-2.5">
              <p className="text-sm text-foreground">{m.label}</p>
              <p className="numeral text-[11px] text-muted-foreground">{m.vintage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="eyebrow">Blank fields</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          An em dash means the value is not yet loaded rather than zero. Commodity growth is shown as a
          percentage where a comparable series exists, and as a short note where the only available signal is
          qualitative. Indicators are published at differing base years and national methodologies; treat every
          figure as a best-available estimate.
        </p>
      </section>
    </div>
  );
}
