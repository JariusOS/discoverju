import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { countriesQuery } from "@/lib/juju-queries";
import { TierBadge } from "@/components/juju/TierBadge";
import { fmtCompact, fmtUsd } from "@/lib/juju-format";
import { SUBREGIONS, TIERS, TIER_LABEL } from "@/lib/juju-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Juju Africa — Search & Explore 54 African Nations" },
      {
        name: "description",
        content:
          "Juju Africa is a discovery atlas: search structured data for all 54 African countries or explore the continent on a satellite map of economic nodes.",
      },
      { property: "og:title", content: "Juju Africa — Search & Explore 54 African Nations" },
      {
        property: "og:description",
        content:
          "Two modes of discovery: search 13 standardized indicators per nation, or navigate Africa on a satellite map of ports, mines and export hubs.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: HomePage,
});

function HomePage() {
  const { data: countries } = useSuspenseQuery(countriesQuery);

  const totalPop = countries.reduce((sum, c) => sum + Number(c.total_population ?? 0), 0);
  const totalGdp = countries.reduce((sum, c) => sum + Number(c.gdp_nominal_usd ?? 0), 0);
  const elite = countries.filter((c) => c.tier === "elite");

  return (
    <div>
      <section className="border-b border-hairline px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Discovery atlas · 54 sovereign nations</p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] sm:text-6xl">
            A single, structured way to read the whole of <span className="text-primary">Africa</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Juju Africa runs on two modes. <strong className="text-foreground">Search</strong> compares 13
            standardized indicators across every nation. <strong className="text-foreground">Explore</strong>{" "}
            flies you over the continent on satellite imagery, node by node — ports, mines, terminals and
            capitals.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/search"
              className="group rounded-sm border border-hairline bg-card p-6 transition-colors hover:border-primary/60"
            >
              <p className="eyebrow">Mode 01</p>
              <h2 className="mt-2 text-2xl text-foreground">Search</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Filter by sub-region, tier and indicator. Rank nations on GDP, population, literacy, minimum
                wage, life expectancy and more.
              </p>
              <span className="mt-4 inline-block font-mono text-xs text-primary group-hover:underline">
                Open search →
              </span>
            </Link>
            <Link
              to="/explore"
              className="group rounded-sm border border-hairline bg-card p-6 transition-colors hover:border-primary/60"
            >
              <p className="eyebrow">Mode 02</p>
              <h2 className="mt-2 text-2xl text-foreground">Explore</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Google-Earth-style navigation: satellite and terrain layers, tilt and rotation, country nodes
                and their ranked economic assets.
              </p>
              <span className="mt-4 inline-block font-mono text-xs text-primary group-hover:underline">
                Launch map →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline px-4 py-12 sm:px-6">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: "Nations", value: String(countries.length) },
            { label: "Combined population", value: fmtCompact(totalPop) },
            { label: "Combined nominal GDP", value: fmtUsd(totalGdp) },
            { label: "Sub-regions", value: String(SUBREGIONS.length) },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="numeral mt-2 text-2xl text-foreground sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Tier architecture</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">Elite, Standard, Emerging</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Every nation is classified by economic size, geographic advantage and relevance to global export
            commodity supply chains.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TIERS.map((tier) => {
              const members = countries.filter((c) => c.tier === tier);
              return (
                <div key={tier} className="rounded-sm border border-hairline bg-card p-5">
                  <TierBadge tier={tier} />
                  <p className="numeral mt-3 text-3xl text-foreground">{members.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {TIER_LABEL[tier]} nations ·{" "}
                    {Math.round((members.length / Math.max(countries.length, 1)) * 100)}% of the continent
                  </p>
                </div>
              );
            })}
          </div>

          <h3 className="mt-12 text-xl">Elite nodes</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {elite.map((country) => (
              <li key={country.slug}>
                <Link
                  to="/country/$slug"
                  params={{ slug: country.slug }}
                  className="block rounded-sm border border-hairline bg-card p-4 transition-colors hover:border-primary/60"
                >
                  <p className="text-sm text-foreground">
                    {country.flag_emoji} {country.common_name}
                  </p>
                  <p className="numeral mt-1 text-xs text-muted-foreground">
                    {fmtUsd(country.gdp_nominal_usd)} GDP
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
