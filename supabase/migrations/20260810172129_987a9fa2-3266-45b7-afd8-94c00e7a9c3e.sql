CREATE TYPE public.country_tier AS ENUM ('elite','standard','emerging');
CREATE TYPE public.africa_subregion AS ENUM ('North Africa','West Africa','Central Africa','East Africa','Southern Africa');

CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  common_name text NOT NULL,
  official_name text NOT NULL,
  iso2 text,
  iso3 text,
  subregion public.africa_subregion NOT NULL,
  tier public.country_tier NOT NULL DEFAULT 'standard',
  tier_rationale text,
  headline_export_value_usd numeric,
  flag_emoji text,
  latitude numeric,
  longitude numeric,
  map_zoom numeric DEFAULT 5,
  capital_city text,
  capital_population bigint,
  largest_city text,
  largest_city_population bigint,
  subdivision_count integer,
  subdivision_designation text,
  subdivision_notes text,
  total_population bigint,
  gdp_nominal_usd numeric,
  gdp_per_capita_usd numeric,
  minimum_wage_monthly_usd numeric,
  life_expectancy_years numeric,
  youth_under_30_pct numeric,
  poverty_headcount_pct numeric,
  adult_literacy_pct numeric,
  sex_ratio_males_per_female numeric,
  structural_parameter_label text,
  structural_parameter_value text,
  data_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.country_subnodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  asset_code text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  rank integer,
  latitude numeric,
  longitude numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX country_subnodes_country_idx ON public.country_subnodes(country_id, rank);

CREATE TABLE public.commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  hs4_code text,
  rank integer,
  categories text[] NOT NULL DEFAULT '{}',
  african_export_value_usd numeric,
  global_market_value_usd numeric,
  africa_share_pct numeric,
  reserves_value_usd numeric,
  reserves_label text,
  yoy_growth_pct numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.country_commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  commodity_id uuid NOT NULL REFERENCES public.commodities(id) ON DELETE CASCADE,
  exporter_rank integer,
  is_primary_export boolean NOT NULL DEFAULT false,
  primary_export_rank integer,
  label_override text,
  UNIQUE (country_id, commodity_id)
);
CREATE INDEX country_commodities_commodity_idx ON public.country_commodities(commodity_id, exporter_rank);

GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.country_subnodes TO anon, authenticated;
GRANT SELECT ON public.commodities TO anon, authenticated;
GRANT SELECT ON public.country_commodities TO anon, authenticated;
GRANT ALL ON public.countries TO service_role;
GRANT ALL ON public.country_subnodes TO service_role;
GRANT ALL ON public.commodities TO service_role;
GRANT ALL ON public.country_commodities TO service_role;

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_subnodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_commodities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are publicly readable" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Subnodes are publicly readable" ON public.country_subnodes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Commodities are publicly readable" ON public.commodities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Country commodities are publicly readable" ON public.country_commodities FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER countries_set_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER commodities_set_updated_at BEFORE UPDATE ON public.commodities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();