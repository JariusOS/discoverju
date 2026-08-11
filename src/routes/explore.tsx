import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AfricaMap } from "@/components/juju/AfricaMap";
import { TierBadge } from "@/components/juju/TierBadge";
import { countriesQuery, countryQuery } from "@/lib/juju-queries";
import { fmtCompact, fmtUsd } from "@/lib/juju-format";
import { SUBREGIONS, TIERS, TIER_LABEL } from "@/lib/juju-types";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Africa on Satellite Imagery — Juju Africa" },
      {
        name: "description",
        content:
          "Navigate Africa Google-Earth style: satellite and terrain layers, tilt and rotation, country nodes and ranked ports, mines and export terminals.",
      },
      { property: "og:title", content: "Explore Africa on Satellite Imagery — Juju Africa" },
      {
        property: "og:description",
        content: "Fly across the continent and open any nation's economic nodes from the map.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: ExplorePage,
});

function ExplorePage() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [selected, setSelected] = useState<string | null>(null);
  const [subregion, setSubregion] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const visible = useMemo(
    () =>
      countries.filter(
        (c) =>
          (subregion === "all" || c.subregion === subregion) && (tier === "all" || c.tier === tier),
      ),
    [countries, subregion, tier],
  );

  const detail = useQuery({ ...countryQuery(selected ?? ""), enabled: Boolean(selected) });
  const selectedCountry = countries.find((c) => c.slug === selected) ?? null;

  function focusCountry(slug: string) {
    setSelected(slug);
    const country = countries.find((c) => c.slug === slug);
    if (country?.latitude !== null && country?.longitude !== null && country) {
      setFocus({
        lat: Number(country.latitude),
        lng: Number(country.longitude),
        zoom: Number(country.map_zoom ?? 5),
      });
    }
  }

  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors ${
      active ? "border-primary text-primary" : "border-hairline text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <aside className="w-full shrink-0 overflow-y-auto border-b border-hairline p-4 lg:w-80 lg:border-b-0 lg:border-r">
        <p className="eyebrow">Mode 02 · Explore</p>
        <h1 className="mt-2 text-2xl">Continental navigator</h1>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button type="button" className={chipClass(subregion === "all")} onClick={() => setSubregion("all")}>
            All
          </button>
          {SUBREGIONS.map((s) => (
            <button key={s} type="button" className={chipClass(subregion === s)} onClick={() => setSubregion(s)}>
              {s.replace(" Africa", "")}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" className={chipClass(tier === "all")} onClick={() => setTier("all")}>
            All tiers
          </button>
          {TIERS.map((t) => (
            <button key={t} type="button" className={chipClass(tier === t)} onClick={() => setTier(t)}>
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>

        <ul className="mt-5 space-y-1">
          {visible.map((country) => (
            <li key={country.slug}>
              <button
                type="button"
                onClick={() => focusCountry(country.slug)}
                className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                  selected === country.slug ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <span>
                  {country.flag_emoji} {country.common_name}
                </span>
                <span className="numeral text-[11px]">{fmtCompact(country.total_population)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="relative min-h-[60vh] flex-1 lg:min-h-0">
        <AfricaMap
          countries={visible}
          selectedSlug={selected}
          onSelect={focusCountry}
          subnodes={detail.data?.subnodes ?? []}
          focus={focus}
          className="absolute inset-0"
        />

        {selectedCountry && (
          <div className="absolute right-3 bottom-3 left-3 max-h-[45%] overflow-y-auto rounded-sm border border-hairline bg-background/95 p-4 backdrop-blur sm:left-auto sm:w-96">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{selectedCountry.subregion}</p>
                <h2 className="mt-1 text-xl text-foreground">
                  {selectedCountry.flag_emoji} {selectedCountry.common_name}
                </h2>
              </div>
              <TierBadge tier={selectedCountry.tier} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="eyebrow">Population</dt>
                <dd className="numeral text-foreground">{fmtCompact(selectedCountry.total_population)}</dd>
              </div>
              <div>
                <dt className="eyebrow">GDP</dt>
                <dd className="numeral text-foreground">{fmtUsd(selectedCountry.gdp_nominal_usd)}</dd>
              </div>
              <div>
                <dt className="eyebrow">Capital</dt>
                <dd className="text-foreground">{selectedCountry.capital_city ?? "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Largest city</dt>
                <dd className="text-foreground">{selectedCountry.largest_city ?? "—"}</dd>
              </div>
            </dl>
            {(detail.data?.subnodes?.length ?? 0) > 0 && (
              <div className="mt-3">
                <p className="eyebrow">Economic nodes on map</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {detail.data?.subnodes.map((n) => n.name).join(" · ")}
                </p>
              </div>
            )}
            <Link
              to="/country/$slug"
              params={{ slug: selectedCountry.slug }}
              className="mt-4 inline-block font-mono text-xs text-primary hover:underline"
            >
              Open full country page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
