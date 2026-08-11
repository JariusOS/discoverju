import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { countriesQuery } from "@/lib/juju-queries";
import { TierBadge } from "@/components/juju/TierBadge";
import { fmtCompact, fmtUsd } from "@/lib/juju-format";
import { SUBREGIONS } from "@/lib/juju-types";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "All 54 African Countries by Sub-Region — Juju Africa" },
      {
        name: "description",
        content:
          "Directory of all 54 sovereign African nations grouped by UN and African Union sub-region, with population, GDP and tier classification.",
      },
      { property: "og:title", content: "All 54 African Countries by Sub-Region — Juju Africa" },
      {
        property: "og:description",
        content: "Browse every sovereign African nation grouped by sub-region with headline indicators.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: CountriesPage,
});

function CountriesPage() {
  const { data: countries } = useSuspenseQuery(countriesQuery);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Directory</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">All 54 sovereign nations</h1>

        {SUBREGIONS.map((region) => {
          const members = countries.filter((c) => c.subregion === region);
          if (members.length === 0) return null;
          return (
            <section key={region} className="mt-12">
              <div className="flex items-baseline justify-between border-b border-hairline pb-2">
                <h2 className="text-xl">{region}</h2>
                <span className="numeral text-xs text-muted-foreground">{members.length} nations</span>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((country) => (
                  <li key={country.slug}>
                    <Link
                      to="/country/$slug"
                      params={{ slug: country.slug }}
                      className="block rounded-sm border border-hairline bg-card p-4 transition-colors hover:border-primary/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground">
                          {country.flag_emoji} {country.common_name}
                        </p>
                        <TierBadge tier={country.tier} />
                      </div>
                      <p className="numeral mt-2 text-xs text-muted-foreground">
                        {fmtCompact(country.total_population)} people · {fmtUsd(country.gdp_nominal_usd)} GDP
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{country.capital_city ?? "—"}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
