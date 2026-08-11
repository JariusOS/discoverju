import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { commodityQuery } from "@/lib/juju-queries";
import { fmtPct, fmtUsd } from "@/lib/juju-format";
import { TierBadge } from "@/components/juju/TierBadge";

export const Route = createFileRoute("/commodity/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(commodityQuery(params.slug));
    if (!data) throw notFound();
    return { name: data.commodity.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Commodity not found — Juju Africa" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} Exports from Africa — Juju Africa`;
    const description = `${loaderData.name}: African export value, share of the global market, reserves and the leading African exporter nations.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CommodityPage,
});

function CommodityPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(commodityQuery(slug));
  if (!data) return null;
  const { commodity, exporters } = data;

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">
          comNODE {commodity.rank !== null ? `· rank ${commodity.rank}` : ""}{" "}
          {commodity.hs4_code ? `· HS4 ${commodity.hs4_code}` : ""}
        </p>
        <h1 className="mt-3 text-3xl sm:text-5xl">{commodity.name}</h1>
        {commodity.categories.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{commodity.categories.join(" · ")}</p>
        )}

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "African export value", value: fmtUsd(commodity.african_export_value_usd) },
            { label: "Global market value", value: fmtUsd(commodity.global_market_value_usd) },
            { label: "Africa's share", value: fmtPct(commodity.africa_share_pct) },
            { label: "Year-on-year growth", value: fmtPct(commodity.yoy_growth_pct) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-sm border border-hairline bg-card p-5">
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="numeral mt-2 text-2xl text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {commodity.reserves_value_usd !== null && (
          <p className="mt-6 text-sm text-muted-foreground">
            {commodity.reserves_label ?? "Reserves"}:{" "}
            <span className="numeral text-foreground">{fmtUsd(commodity.reserves_value_usd)}</span>
          </p>
        )}

        {exporters.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl">Leading African exporters</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exporters.map((row) => (
                <li key={row.country.slug}>
                  <Link
                    to="/country/$slug"
                    params={{ slug: row.country.slug }}
                    className="flex items-center justify-between rounded-sm border border-hairline bg-card p-4 transition-colors hover:border-primary/60"
                  >
                    <span className="text-sm text-foreground">
                      <span className="numeral mr-2 text-xs text-primary">
                        {String(row.exporter_rank ?? "·").padStart(2, "0")}
                      </span>
                      {row.country.flag_emoji} {row.country.common_name}
                    </span>
                    <TierBadge tier={row.country.tier} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Link to="/commodities" className="mt-10 inline-block font-mono text-xs text-primary hover:underline">
          ← All commodities
        </Link>
      </div>
    </div>
  );
}
