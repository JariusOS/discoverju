import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { commoditiesQuery } from "@/lib/juju-queries";
import { fmtPct, fmtUsd } from "@/lib/juju-format";

export const Route = createFileRoute("/commodities")({
  head: () => ({
    meta: [
      { title: "Africa's Top Export Commodities — Juju Africa" },
      {
        name: "description",
        content:
          "Ranked African export commodities with HS4 codes, African export value, global market size, Africa's share and leading exporter nations.",
      },
      { property: "og:title", content: "Africa's Top Export Commodities — Juju Africa" },
      {
        property: "og:description",
        content: "The comNODE graph: ranked commodities, values, Africa's share of global supply and top exporters.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(commoditiesQuery),
  component: CommoditiesPage,
});

function CommoditiesPage() {
  const { data: commodities } = useSuspenseQuery(commoditiesQuery);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">comNODE</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Africa's export commodity graph</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Ranked by African export value. Each commodity links to its leading African exporter nations.
        </p>

        <div className="mt-8 overflow-x-auto rounded-sm border border-hairline">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="eyebrow px-4 py-3 font-normal">Rank</th>
                <th className="eyebrow px-4 py-3 font-normal">Commodity</th>
                <th className="eyebrow px-4 py-3 font-normal">HS4</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">African exports</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">Global market</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">Africa share</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">YoY</th>
              </tr>
            </thead>
            <tbody>
              {commodities.map((commodity) => (
                <tr key={commodity.slug} className="border-b border-border/60 last:border-0 hover:bg-secondary/60">
                  <td className="numeral px-4 py-3 text-muted-foreground">{commodity.rank ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/commodity/$slug"
                      params={{ slug: commodity.slug }}
                      className="text-foreground hover:text-primary"
                    >
                      {commodity.name}
                    </Link>
                  </td>
                  <td className="numeral px-4 py-3 text-muted-foreground">{commodity.hs4_code ?? "—"}</td>
                  <td className="numeral px-4 py-3 text-right text-foreground">
                    {fmtUsd(commodity.african_export_value_usd)}
                  </td>
                  <td className="numeral px-4 py-3 text-right text-muted-foreground">
                    {fmtUsd(commodity.global_market_value_usd)}
                  </td>
                  <td className="numeral px-4 py-3 text-right text-primary">
                    {fmtPct(commodity.africa_share_pct)}
                  </td>
                  <td className="numeral px-4 py-3 text-right text-muted-foreground">
                    {fmtPct(commodity.yoy_growth_pct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
