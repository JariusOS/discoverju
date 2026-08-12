import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { countriesQuery } from "@/lib/juju-queries";
import { fmtMetric } from "@/lib/juju-format";
import { METRICS, TIER_LABEL } from "@/lib/juju-types";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare African Countries Side by Side — Juju Africa" },
      {
        name: "description",
        content:
          "Put up to four African nations side by side across GDP, GDP per capita, population, life expectancy, minimum wage, literacy, poverty and youth share.",
      },
      { property: "og:title", content: "Compare African Countries Side by Side — Juju Africa" },
      {
        property: "og:description",
        content: "Pick up to four nations and read every standardized indicator in one column set.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: CompareScreen,
});

function CompareScreen() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [picked, setPicked] = useState<string[]>(["nigeria", "south-africa", "egypt"]);

  const selected = picked
    .map((slug) => countries.find((c) => c.slug === slug))
    .filter((c): c is (typeof countries)[number] => Boolean(c));

  function add(slug: string) {
    if (!slug || picked.includes(slug) || picked.length >= 4) return;
    setPicked([...picked, slug]);
  }

  return (
    <div className="pb-10">
      <div className="border-b border-hairline px-4 pt-4 pb-3">
        <h1 className="text-base text-foreground">Side by side</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">Up to four nations, thirteen-parameter template.</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setPicked(picked.filter((s) => s !== c.slug))}
              className="flex items-center gap-1.5 rounded-full border border-primary/70 bg-primary/10 px-3 py-1.5 text-xs text-primary"
            >
              {c.flag_emoji} {c.common_name}
              <X className="size-3" />
            </button>
          ))}
        </div>

        <select
          value=""
          onChange={(e) => add(e.target.value)}
          disabled={picked.length >= 4}
          className="mt-3 w-full border border-hairline bg-card px-3 py-2.5 text-sm text-foreground outline-none disabled:opacity-50"
        >
          <option value="">{picked.length >= 4 ? "Four is the maximum" : "Add a nation…"}</option>
          {countries
            .filter((c) => !picked.includes(c.slug))
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.common_name}
              </option>
            ))}
        </select>
      </div>

      {selected.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">Add a nation to start comparing.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="eyebrow px-4 py-3 text-left font-normal">Indicator</th>
                {selected.map((c) => (
                  <th key={c.slug} className="px-4 py-3 text-right text-xs font-normal text-foreground">
                    {c.flag_emoji} {c.common_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/70">
                <td className="eyebrow px-4 py-3">Tier</td>
                {selected.map((c) => (
                  <td key={c.slug} className="px-4 py-3 text-right text-xs text-primary">
                    {TIER_LABEL[c.tier]}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/70">
                <td className="eyebrow px-4 py-3">Sub-region</td>
                {selected.map((c) => (
                  <td key={c.slug} className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {c.subregion.replace(" Africa", "")}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/70">
                <td className="eyebrow px-4 py-3">Capital</td>
                {selected.map((c) => (
                  <td key={c.slug} className="px-4 py-3 text-right text-xs text-foreground">
                    {c.capital_city ?? "—"}
                  </td>
                ))}
              </tr>
              {METRICS.map((m) => (
                <tr key={m.key} className="border-b border-border/70">
                  <td className="eyebrow px-4 py-3">{m.label}</td>
                  {selected.map((c) => (
                    <td key={c.slug} className="numeral px-4 py-3 text-right text-foreground">
                      {fmtMetric(m.key, c[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
