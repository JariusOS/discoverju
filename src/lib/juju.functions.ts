import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  CommodityExporter,
  CommoditySummary,
  CountryCommodityLink,
  CountryDetail,
  CountrySummary,
  SubNode,
} from "./juju-types";

const COUNTRY_SUMMARY_COLUMNS =
  "slug, common_name, official_name, iso2, iso3, subregion, tier, flag_emoji, latitude, longitude, map_zoom, capital_city, largest_city, total_population, gdp_nominal_usd, gdp_per_capita_usd, minimum_wage_monthly_usd, life_expectancy_years, youth_under_30_pct, poverty_headcount_pct, adult_literacy_pct";

const COMMODITY_COLUMNS =
  "slug, name, hs4_code, rank, categories, african_export_value_usd, global_market_value_usd, africa_share_pct, reserves_value_usd, reserves_label, yoy_growth_pct";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCountries = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("countries")
    .select(COUNTRY_SUMMARY_COLUMNS)
    .order("common_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CountrySummary[];
});

export const getCountry = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();

    const { data: country, error } = await supabase
      .from("countries")
      .select("*")
      .eq("slug", input.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!country) return null;

    const [subnodesRes, linksRes, peersRes] = await Promise.all([
      supabase
        .from("country_subnodes")
        .select("asset_code, name, category, rank, latitude, longitude")
        .eq("country_id", (country as { id: string }).id)
        .order("rank", { ascending: true }),
      supabase
        .from("country_commodities")
        .select(`exporter_rank, is_primary_export, primary_export_rank, label_override, commodities(${COMMODITY_COLUMNS})`)
        .eq("country_id", (country as { id: string }).id),
      supabase
        .from("countries")
        .select("slug, common_name, flag_emoji, subregion, tier")
        .eq("subregion", (country as { subregion: string }).subregion)
        .neq("slug", input.slug)
        .order("common_name", { ascending: true }),
    ]);

    const links = (linksRes.data ?? []).map((row) => {
      const r = row as unknown as {
        exporter_rank: number | null;
        is_primary_export: boolean;
        primary_export_rank: number | null;
        label_override: string | null;
        commodities: CommoditySummary;
      };
      return {
        commodity: r.commodities,
        exporter_rank: r.exporter_rank,
        is_primary_export: r.is_primary_export,
        primary_export_rank: r.primary_export_rank,
        label_override: r.label_override,
      } satisfies CountryCommodityLink;
    });

    const { id: _id, created_at: _c, updated_at: _u, ...detail } = country as Record<string, unknown>;

    return {
      country: detail as unknown as CountryDetail,
      subnodes: (subnodesRes.data ?? []) as unknown as SubNode[],
      commodities: links,
      peers: (peersRes.data ?? []) as unknown as Pick<
        CountrySummary,
        "slug" | "common_name" | "flag_emoji" | "subregion" | "tier"
      >[],
    };
  });

export const listCommodities = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("commodities")
    .select(COMMODITY_COLUMNS)
    .order("rank", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CommoditySummary[];
});

export const getCommodity = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();
    const { data: commodity, error } = await supabase
      .from("commodities")
      .select(`id, ${COMMODITY_COLUMNS}`)
      .eq("slug", input.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!commodity) return null;

    const { data: rows } = await supabase
      .from("country_commodities")
      .select("exporter_rank, countries(slug, common_name, flag_emoji, subregion, tier)")
      .eq("commodity_id", (commodity as { id: string }).id)
      .not("exporter_rank", "is", null)
      .order("exporter_rank", { ascending: true });

    const exporters = (rows ?? []).map((row) => {
      const r = row as unknown as { exporter_rank: number | null; countries: CommodityExporter["country"] };
      return { country: r.countries, exporter_rank: r.exporter_rank } satisfies CommodityExporter;
    });

    const { id: _id, ...rest } = commodity as Record<string, unknown>;
    return { commodity: rest as unknown as CommoditySummary, exporters };
  });
