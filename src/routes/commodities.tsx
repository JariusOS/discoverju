import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { commoditiesQuery } from "@/lib/juju-queries";
import { fmtPct, fmtUsd } from "@/lib/juju-format";
import { CATEGORY_COLOR, CATEGORY_ORDER } from "@/lib/juju-types";
import { FilterChips } from "@/components/juju/FilterChips";
import { RecordRow } from "@/components/juju/RecordRow";

export const Route = createFileRoute("/commodities")({
  head: () => ({
    meta: [
      { title: "Africa's Top 54 Export Commodities — Juju Africa" },
      {
        name: "description",
        content:
          "The full African export ledger: 54 commodities with HS codes, African export value, global market size, Africa's share of world supply, reserves and year-on-year growth.",
      },
      { property: "og:title", content: "Africa's Top 54 Export Commodities — Juju Africa" },
      {
        property: "og:description",
        content: "Ranked commodities, Africa's share of global supply, reserve values and leading exporters.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(commoditiesQuery),
  component: CommoditiesScreen,
});

type Sort = "value" | "share" | "growth" | "global";

const SORTS = [
  { value: "value", label: "African value" },
  { value: "share", label: "Africa share" },
  { value: "growth", label: "YoY growth" },
  { value: "global", label: "Global market" },
];

function CommoditiesScreen() {
  const { data: commodities } = useSuspenseQuery(commoditiesQuery);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("value");

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    const num = (v: number | null | undefined) => (v === null || v === undefined ? -Infinity : Number(v));
    return commodities
      .filter((c) => category === "all" || c.categories.includes(category))
      .filter(
        (c) =>
          q.length === 0 || c.name.toLowerCase().includes(q) || (c.hs4_code ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sort === "share") return num(b.africa_share_pct) - num(a.africa_share_pct);
        if (sort === "growth") return num(b.yoy_growth_pct) - num(a.yoy_growth_pct);
        if (sort === "global") return num(b.global_market_value_usd) - num(a.global_market_value_usd);
        return num(b.african_export_value_usd) - num(a.african_export_value_usd);
      });
  }, [commodities, term, category, sort]);

  const presentCategories = useMemo(() => {
    const set = new Set(commodities.flatMap((c) => c.categories));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [commodities]);

  return (
    <div className="pb-8">
      <div className="sticky top-0 z-10 border-b border-hairline bg-background/97 px-4 pt-4 pb-3 backdrop-blur">
        <label className="flex items-center gap-2 border border-hairline bg-card px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search commodity or HS code…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <FilterChips
          className="mt-2.5"
          chips={[
            { value: "all", label: "All classes" },
            ...presentCategories.map((c) => ({
              value: c,
              label: c.replace(" Products", "").replace(" Commodity", "").replace(" Minerals", ""),
              dotClass: CATEGORY_COLOR[c] ?? "text-muted-foreground",
            })),
          ]}
          active={category}
          onChange={setCategory}
        />
        <FilterChips
          className="mt-2"
          chips={SORTS}
          active={sort}
          onChange={(v) => setSort(v as Sort)}
        />
      </div>

      <div className="flex items-baseline justify-between px-4 py-2.5">
        <p className="eyebrow">{rows.length} commodity lines</p>
        <p className="eyebrow">comNODE ledger</p>
      </div>

      <div>
        {rows.map((c) => (
          <RecordRow
            key={c.slug}
            dotClass={CATEGORY_COLOR[c.categories[0] ?? ""] ?? "text-muted-foreground"}
            title={`${String(c.rank ?? 0).padStart(2, "0")} · ${c.name}`}
            meta={`HS ${c.hs4_code ?? "—"} · Africa share ${fmtPct(c.africa_share_pct)} · ${c.categories.join(" · ")}`}
            value={fmtUsd(c.african_export_value_usd)}
            valueCaption={
              c.yoy_growth_pct === null
                ? "—"
                : `${c.yoy_growth_pct > 0 ? "+" : ""}${c.yoy_growth_pct}% YoY`
            }
            to="/commodity/$slug"
            params={{ slug: c.slug }}
          />
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No commodity matches that filter.</p>
        )}
      </div>
    </div>
  );
}
