# Juju Africa — Discovery App

A two-mode discovery app for Africa: **Search** (fast lookup across all 54 countries and their indicators) and **Explore** (satellite/terrain map navigation across the continent). Every sovereign nation gets a structured country page carrying the full 13-parameter dataset.

## Modes

**Search mode**
- Instant fuzzy search over country names, capitals, largest cities, and sub-regions.
- Filter/sort by sub-region, population, GDP, GDP per capita, life expectancy, poverty rate, literacy, youth share, minimum wage.
- Results as a comparison-friendly list; any two-to-four countries can be compared side by side.

**Explore mode**
- Full-screen Google Maps satellite/hybrid view centred on Africa with tilt and terrain, plus keyboard/drag "fly around" navigation.
- 54 country markers; clicking one flies to that country's centroid and opens a summary card with a link into the full country page.
- Sub-region toggles (North, West, Central, East, Southern) to isolate parts of the continent.
- A choropleth-style data overlay: pick an indicator (e.g. GDP per capita, life expectancy) and countries are colour-graded by value.

## Country pages

Route: `/country/{slug}` (e.g. `/country/nigeria`), one page per nation, all sharing one template:

1. Official country name
2. Geographic sub-region (UN/AU classification)
3. Primary political subdivisions — count, structure, legal designation
4. Total population
5. Capital city & its population
6. Most populated city & its population
7. GDP (nominal, current USD) & GDP per capita
8. Monthly statutory minimum wage (USD)
9. Life expectancy at birth
10. Youth demographic profile (% under 30)
11. Poverty headcount ratio (%)
12. Adult literacy rate (15+)
13. Sex ratio (males per female)
14. Aligned structural parameter (urbanization rate, key export share, or primary-sector employment — chosen per country)

Each page shows: a hero with flag, name, sub-region and coordinates; an indicator grid with plain-language definitions on hover; a mini map of the country; a "how this country compares to the African median" bar for each numeric indicator; and neighbouring/same-region country links.

An overview page at `/countries` lists all 54 grouped by sub-region.

## Data

All 54 countries live in the Lovable Cloud database so the dataset can be edited and extended later.

- `countries` table: slug, official name, common name, ISO codes, sub-region, centroid lat/lng, default map zoom, flag emoji, and all 13 indicators plus the structural parameter (value + label) and a `data_notes` field for caveats.
- Public read access only (anon SELECT); no user accounts in this build.
- The migration includes literal INSERT rows for all 54 sovereign nations with best-available published estimates, so pages are populated the moment the app loads.
- Indicator metadata (definition text shown in the UI) ships as a small typed constant in code.

## Design direction

Editorial-cartographic rather than dashboard-generic: deep ink background, warm ochre/terracotta accents drawn from African earth pigments, a strong display typeface for country names paired with a clean grotesque for data, thin hairline rules and monospaced numerals for indicator tables. The map is the hero in Explore; type is the hero in Search.

## Technical notes

- Google Maps Platform via the Lovable-managed connector — browser key for the Maps JS API in Explore, gateway calls for any geocoding.
- Lovable Cloud enabled for the database; country reads go through a public server function using the publishable key (no admin client), so country pages are server-rendered and SEO-indexable.
- TanStack Router file routes: `index.tsx` (mode chooser / landing), `search.tsx`, `explore.tsx`, `countries.index.tsx`, `country.$slug.tsx`. Loaders prime TanStack Query; each route has its own `head()` metadata, and country pages get per-country titles, descriptions and OG tags.
- Country data fetched once and cached; search and filtering run client-side for instant response.

## Caveats

Figures for minimum wage, poverty headcount, youth share and literacy are published at different base years and by different national methodologies; each country row records its source year and any methodology note, surfaced on the page so numbers are never presented as more precise than they are.
