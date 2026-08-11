import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AfricaMap } from "@/components/juju/AfricaMap";
import { TierBadge } from "@/components/juju/TierBadge";
import { countryQuery } from "@/lib/juju-queries";
import { EMPTY, fmtCompact, fmtNumber, fmtPct, fmtRatio, fmtUsd, fmtYears } from "@/lib/juju-format";
import { INDICATOR_DEFINITIONS, TIER_LABEL } from "@/lib/juju-types";

export const Route = createFileRoute("/country/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(countryQuery(params.slug));
    if (!data) throw notFound();
    return { name: data.country.common_name, subregion: data.country.subregion };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Country not found — Juju Africa" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Country Profile & Data | Juju Africa`;
    const description = `${loaderData.name} in ${loaderData.subregion}: population, GDP, minimum wage, literacy, life expectancy, administrative divisions, exports and economic nodes.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CountryPage,
});

function Row({
  label,
  value,
  definition,
}: {
  label: string;
  value: string;
  definition?: string | undefined;
}) {
  return (
    <div className="border-b border-border/60 py-4 last:border-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="numeral mt-1 text-lg text-foreground">{value}</dd>
      {definition && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{definition}</p>}
    </div>
  );
}

function CountryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(countryQuery(slug));
  if (!data) return null;

  const { country, subnodes, commodities, peers } = data;
  const primaryExports = commodities
    .filter((c) => c.is_primary_export)
    .sort((a, b) => (a.primary_export_rank ?? 99) - (b.primary_export_rank ?? 99));
  const exporterRanks = commodities
    .filter((c) => c.exporter_rank !== null)
    .sort((a, b) => (a.exporter_rank ?? 99) - (b.exporter_rank ?? 99));

  const subdivisions =
    country.subdivision_count !== null
      ? `${fmtNumber(country.subdivision_count)} ${country.subdivision_designation ?? "divisions"}`
      : (country.subdivision_designation ?? EMPTY);

  const nodesByCategory = subnodes.reduce<Record<string, typeof subnodes>>((acc, node) => {
    (acc[node.category] ??= []).push(node);
    return acc;
  }, {});

  return (
    <div>
      <header className="border-b border-hairline px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">
            {country.subregion} · {TIER_LABEL[country.tier]} tier · {country.iso3 ?? ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-5xl">
              {country.flag_emoji} {country.common_name}
            </h1>
            <TierBadge tier={country.tier} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{country.official_name}</p>
          {country.tier_rationale && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground">{country.tier_rationale}</p>
          )}
        </div>
      </header>

      <section className="border-b border-hairline px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl">Standardized indicators</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              13-parameter data architecture applied identically to all 54 nations. Blank fields await source
              data.
            </p>
            <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
              <Row
                label="Official country name"
                value={country.official_name}
                definition={INDICATOR_DEFINITIONS["official_name"]}
              />
              <Row
                label="Geographic sub-region"
                value={country.subregion}
                definition={INDICATOR_DEFINITIONS["subregion"]}
              />
              <Row
                label="Primary political subdivisions"
                value={subdivisions}
                definition={country.subdivision_notes ?? INDICATOR_DEFINITIONS["subdivisions"]}
              />
              <Row
                label="Total population"
                value={fmtNumber(country.total_population)}
                definition={INDICATOR_DEFINITIONS["total_population"]}
              />
              <Row
                label="Capital city & population"
                value={`${country.capital_city ?? EMPTY} · ${fmtCompact(country.capital_population)}`}
                definition={INDICATOR_DEFINITIONS["capital"]}
              />
              <Row
                label="Most populated city & population"
                value={`${country.largest_city ?? EMPTY} · ${fmtCompact(country.largest_city_population)}`}
                definition={INDICATOR_DEFINITIONS["largest_city"]}
              />
              <Row
                label="GDP & per capita"
                value={`${fmtUsd(country.gdp_nominal_usd)} · ${fmtUsd(country.gdp_per_capita_usd)}`}
                definition={INDICATOR_DEFINITIONS["gdp"]}
              />
              <Row
                label="Monthly statutory minimum wage"
                value={fmtUsd(country.minimum_wage_monthly_usd)}
                definition={INDICATOR_DEFINITIONS["minimum_wage"]}
              />
              <Row
                label="Life expectancy at birth"
                value={fmtYears(country.life_expectancy_years)}
                definition={INDICATOR_DEFINITIONS["life_expectancy"]}
              />
              <Row
                label="Youth demographic profile (under 30)"
                value={fmtPct(country.youth_under_30_pct)}
                definition={INDICATOR_DEFINITIONS["youth"]}
              />
              <Row
                label="Poverty headcount ratio"
                value={fmtPct(country.poverty_headcount_pct)}
                definition={INDICATOR_DEFINITIONS["poverty"]}
              />
              <Row
                label="Adult literacy & educated %"
                value={fmtPct(country.adult_literacy_pct)}
                definition={INDICATOR_DEFINITIONS["literacy"]}
              />
              <Row
                label="Sex ratio (males per female)"
                value={fmtRatio(country.sex_ratio_males_per_female)}
                definition={INDICATOR_DEFINITIONS["sex_ratio"]}
              />
              <Row
                label={country.structural_parameter_label ?? "Aligned structural parameter"}
                value={country.structural_parameter_value ?? EMPTY}
                definition={INDICATOR_DEFINITIONS["structural"]}
              />
            </dl>
            {country.data_notes && (
              <p className="mt-6 text-xs text-muted-foreground">Notes: {country.data_notes}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl">geoNODE</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Satellite view with the nation's ranked economic sub-nodes.
            </p>
            <div className="relative mt-4 h-72 overflow-hidden rounded-sm border border-hairline">
              <AfricaMap
                countries={[{ ...country, map_zoom: country.map_zoom ?? 5 }]}
                selectedSlug={country.slug}
                subnodes={subnodes}
                focus={
                  country.latitude !== null && country.longitude !== null
                    ? {
                        lat: Number(country.latitude),
                        lng: Number(country.longitude),
                        zoom: Number(country.map_zoom ?? 5),
                      }
                    : null
                }
                className="absolute inset-0"
              />
            </div>

            {primaryExports.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow">Primary exports</p>
                <ol className="mt-2 space-y-1 text-sm">
                  {primaryExports.map((link) => (
                    <li key={link.commodity.slug} className="flex items-baseline gap-2">
                      <span className="numeral text-xs text-muted-foreground">
                        {String(link.primary_export_rank ?? "·").padStart(2, "0")}
                      </span>
                      <Link
                        to="/commodity/$slug"
                        params={{ slug: link.commodity.slug }}
                        className="text-foreground hover:text-primary"
                      >
                        {link.label_override ?? link.commodity.name}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {country.headline_export_value_usd !== null && (
              <div className="mt-6">
                <p className="eyebrow">Headline export value</p>
                <p className="numeral mt-1 text-2xl text-foreground">
                  {fmtUsd(country.headline_export_value_usd)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {Object.keys(nodesByCategory).length > 0 && (
        <section className="border-b border-hairline px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl">Economic sub-nodes</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(nodesByCategory).map(([category, nodes]) => (
                <div key={category} className="rounded-sm border border-hairline bg-card p-5">
                  <p className="eyebrow">{category}</p>
                  <ol className="mt-3 space-y-2 text-sm">
                    {nodes.map((node) => (
                      <li key={node.asset_code} className="flex items-baseline gap-2">
                        <span className="numeral text-xs text-muted-foreground">
                          {node.rank !== null ? String(node.rank).padStart(2, "0") : "··"}
                        </span>
                        <span className="text-foreground">{node.name}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {exporterRanks.length > 0 && (
        <section className="border-b border-hairline px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl">Commodity export standing</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exporterRanks.map((link) => (
                <li key={link.commodity.slug}>
                  <Link
                    to="/commodity/$slug"
                    params={{ slug: link.commodity.slug }}
                    className="flex items-center justify-between rounded-sm border border-hairline bg-card p-4 transition-colors hover:border-primary/60"
                  >
                    <span className="text-sm text-foreground">{link.commodity.name}</span>
                    <span className="numeral text-xs text-primary">#{link.exporter_rank} in Africa</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {peers.length > 0 && (
        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl">Other nations in {country.subregion}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {peers.map((peer) => (
                <li key={peer.slug}>
                  <Link
                    to="/country/$slug"
                    params={{ slug: peer.slug }}
                    className="inline-block rounded-full border border-hairline px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                  >
                    {peer.flag_emoji} {peer.common_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
