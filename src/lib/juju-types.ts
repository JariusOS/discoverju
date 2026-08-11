export type Tier = "elite" | "standard" | "emerging";

export type Subregion =
  | "North Africa"
  | "West Africa"
  | "Central Africa"
  | "East Africa"
  | "Southern Africa";

export const SUBREGIONS: Subregion[] = [
  "North Africa",
  "West Africa",
  "Central Africa",
  "East Africa",
  "Southern Africa",
];

export const TIERS: Tier[] = ["elite", "standard", "emerging"];

export const TIER_LABEL: Record<Tier, string> = {
  elite: "Elite",
  standard: "Standard",
  emerging: "Emerging",
};

export type CountrySummary = {
  slug: string;
  common_name: string;
  official_name: string;
  iso2: string | null;
  iso3: string | null;
  subregion: Subregion;
  tier: Tier;
  flag_emoji: string | null;
  latitude: number | null;
  longitude: number | null;
  map_zoom: number | null;
  capital_city: string | null;
  largest_city: string | null;
  total_population: number | null;
  gdp_nominal_usd: number | null;
  gdp_per_capita_usd: number | null;
  minimum_wage_monthly_usd: number | null;
  life_expectancy_years: number | null;
  youth_under_30_pct: number | null;
  poverty_headcount_pct: number | null;
  adult_literacy_pct: number | null;
};

export type CountryDetail = CountrySummary & {
  tier_rationale: string | null;
  headline_export_value_usd: number | null;
  capital_population: number | null;
  largest_city_population: number | null;
  subdivision_count: number | null;
  subdivision_designation: string | null;
  subdivision_notes: string | null;
  sex_ratio_males_per_female: number | null;
  structural_parameter_label: string | null;
  structural_parameter_value: string | null;
  data_notes: string | null;
};

export type SubNode = {
  asset_code: string;
  name: string;
  category: string;
  rank: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type CommoditySummary = {
  slug: string;
  name: string;
  hs4_code: string | null;
  rank: number | null;
  categories: string[];
  african_export_value_usd: number | null;
  global_market_value_usd: number | null;
  africa_share_pct: number | null;
  reserves_value_usd: number | null;
  reserves_label: string | null;
  yoy_growth_pct: number | null;
};

export type CountryCommodityLink = {
  commodity: CommoditySummary;
  exporter_rank: number | null;
  is_primary_export: boolean;
  primary_export_rank: number | null;
  label_override: string | null;
};

export type CommodityExporter = {
  country: Pick<CountrySummary, "slug" | "common_name" | "flag_emoji" | "subregion" | "tier">;
  exporter_rank: number | null;
};

/** Metric keys that can drive the Explore choropleth and Search sorting. */
export type MetricKey =
  | "total_population"
  | "gdp_nominal_usd"
  | "gdp_per_capita_usd"
  | "minimum_wage_monthly_usd"
  | "life_expectancy_years"
  | "youth_under_30_pct"
  | "poverty_headcount_pct"
  | "adult_literacy_pct";

export const METRICS: { key: MetricKey; label: string; unit: "usd" | "count" | "pct" | "years" }[] = [
  { key: "gdp_per_capita_usd", label: "GDP per capita", unit: "usd" },
  { key: "gdp_nominal_usd", label: "GDP (nominal)", unit: "usd" },
  { key: "total_population", label: "Population", unit: "count" },
  { key: "life_expectancy_years", label: "Life expectancy", unit: "years" },
  { key: "minimum_wage_monthly_usd", label: "Minimum wage / month", unit: "usd" },
  { key: "youth_under_30_pct", label: "Under 30", unit: "pct" },
  { key: "poverty_headcount_pct", label: "Poverty headcount", unit: "pct" },
  { key: "adult_literacy_pct", label: "Adult literacy", unit: "pct" },
];

export const INDICATOR_DEFINITIONS: Record<string, string> = {
  official_name: "The full, constitutionally recognized name of the sovereign nation.",
  subregion:
    "Regional classification designated by the United Nations and African Union: North, West, Central, East or Southern Africa.",
  subdivisions:
    "The count, structure and formal legal designation of the country's first-tier administrative divisions.",
  total_population: "National population estimate derived from international demographic database baselines.",
  capital: "Designated political and administrative capital city alongside its resident population.",
  largest_city: "The primary commercial hub or largest metropolitan urban center by population scale.",
  gdp: "Nominal GDP expressed in current United States Dollars, paired with nominal per-capita GDP.",
  minimum_wage: "Official legal baseline monthly compensation converted to USD.",
  life_expectancy: "Average life expectancy in years for a newborn based on mortality indicators.",
  youth: "Proportion of the total national population under 30 years of age.",
  poverty:
    "Percentage of the population living below national poverty baselines or international poverty metrics.",
  literacy: "Percentage of the adult population aged 15 and above capable of reading and writing.",
  sex_ratio: "Ratio of males to females within the population, expressed as males per female.",
  structural:
    "A relevant contextual development metric such as urbanization rate, key export share or primary-sector employment contribution.",
};
