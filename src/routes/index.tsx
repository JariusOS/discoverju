import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AfricaMap } from "@/components/juju/AfricaMap";
import { LayersPanel, type FillKey } from "@/components/juju/LayersPanel";
import { BottomSheet } from "@/components/juju/BottomSheet";
import { FilterChips } from "@/components/juju/FilterChips";
import { TierBadge } from "@/components/juju/TierBadge";
import { MAP_COLORS, rampColor } from "@/components/juju/map-theme";
import { countriesQuery, countryQuery } from "@/lib/juju-queries";
import { fmtCompact, fmtMetric, fmtUsd } from "@/lib/juju-format";
import { METRICS, SUBREGIONS, type MetricKey } from "@/lib/juju-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Juju Africa — Map of 54 African Economies" },
      {
        name: "description",
        content:
          "Navigate Africa on a dark data map: fill all 54 countries by GDP, population, literacy or poverty, and open ports, mines and export terminals node by node.",
      },
      { property: "og:title", content: "Juju Africa — Map of 54 African Economies" },
      {
        property: "og:description",
        content: "A continental data map: choropleth indicator fills, economic weight bubbles and export nodes.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(countriesQuery),
  component: MapScreen,
});

function MapScreen() {
  const { data: countries } = useSuspenseQuery(countriesQuery);
  const [selected, setSelected] = useState<string | null>(null);
  const [subregion, setSubregion] = useState("all");
  const [fill, setFill] = useState<FillKey>("tier");
  const [layersOpen, setLayersOpen] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const visible = useMemo(
    () => countries.filter((c) => subregion === "all" || c.subregion === subregion),
    [countries, subregion],
  );

  const fillByIso3 = useMemo(() => {
    const out: Record<string, string> = {};
    if (fill === "none") return out;
    if (fill === "tier") {
      visible.forEach((c) => {
        if (c.iso3) out[c.iso3] = MAP_COLORS[c.tier];
      });
      return out;
    }
    const key = fill as MetricKey;
    const values = visible
      .map((c) => Number(c[key] ?? Number.NaN))
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);
    if (values.length === 0) return out;
    visible.forEach((c) => {
      const value = Number(c[key] ?? Number.NaN);
      if (!Number.isFinite(value) || !c.iso3) return;
      const rank = values.filter((v) => v <= value).length / values.length;
      out[c.iso3] = rampColor(rank);
    });
    return out;
  }, [visible, fill]);

  const bubbleScale = useMemo(() => {
    const max = Math.max(...visible.map((c) => Number(c.gdp_nominal_usd ?? 0)), 1);
    const out: Record<string, number> = {};
    visible.forEach((c) => {
      out[c.slug] = Number(c.gdp_nominal_usd ?? 0) / max;
    });
    return out;
  }, [visible]);

  const detail = useQuery({ ...countryQuery(selected ?? ""), enabled: Boolean(selected) });
  const selectedCountry = countries.find((c) => c.slug === selected) ?? null;
  const activeMetric = METRICS.find((m) => m.key === fill);

  function focusCountry(slug: string) {
    setSelected(slug);
    const country = countries.find((c) => c.slug === slug);
    if (country?.latitude != null && country.longitude != null) {
      setFocus({
        lat: Number(country.latitude),
        lng: Number(country.longitude),
        zoom: Number(country.map_zoom ?? 5),
      });
    }
  }

  return (
    <div className="absolute inset-0">
      <AfricaMap
        countries={visible}
        selectedSlug={selected}
        onSelect={focusCountry}
        subnodes={detail.data?.subnodes ?? []}
        focus={focus}
        fillByIso3={fillByIso3}
        bubbleScale={bubbleScale}
        className="absolute inset-0"
      />

      <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background/90 to-transparent px-3 py-2.5">
        <FilterChips
          chips={[
            { value: "all", label: "All Africa" },
            ...SUBREGIONS.map((s) => ({ value: s, label: s.replace(" Africa", "") })),
          ]}
          active={subregion}
          onChange={setSubregion}
          className="pr-24"
        />
      </div>

      <LayersPanel open={layersOpen} onOpenChange={setLayersOpen} fill={fill} onFillChange={setFill} />

      <div className="pointer-events-none absolute bottom-3 left-3 z-10 border border-hairline bg-background/90 px-3 py-2 backdrop-blur">
        <p className="eyebrow">Fill</p>
        <p className="mt-0.5 text-xs text-foreground">
          {fill === "none" ? "No fill" : fill === "tier" ? "Tier classification" : activeMetric?.label}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">Bubble size = nominal GDP</p>
      </div>

      <BottomSheet open={Boolean(selectedCountry)} onClose={() => setSelected(null)}>
        {selectedCountry && (
          <div className="p-4">
            <p className="eyebrow">{selectedCountry.subregion}</p>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-lg text-foreground">
                {selectedCountry.flag_emoji} {selectedCountry.common_name}
              </h2>
              <TierBadge tier={selectedCountry.tier} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
              {activeMetric && (
                <div>
                  <dt className="eyebrow">{activeMetric.label}</dt>
                  <dd className="numeral text-primary">
                    {fmtMetric(activeMetric.key, selectedCountry[activeMetric.key])}
                  </dd>
                </div>
              )}
            </dl>

            {(detail.data?.subnodes?.length ?? 0) > 0 && (
              <div className="mt-3 border-t border-hairline pt-3">
                <p className="eyebrow">Economic nodes on map</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {detail.data?.subnodes.map((n) => n.name).join(" · ")}
                </p>
              </div>
            )}

            <Link
              to="/country/$slug"
              params={{ slug: selectedCountry.slug }}
              className="mt-4 inline-block text-xs text-primary hover:underline"
            >
              Open full country record →
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
