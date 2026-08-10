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

## Tier classification

Every country carries a tier badge, shown on its page, in search filters, and as a map legend in Explore:

- **Elite** (~12.5%) — drives continental GDP, controls vital trade routes, or dominates a critical global mineral/energy supply chain. Seeded with South Africa, Nigeria, Egypt, Morocco (the "A7Nations" set, remaining members to be supplied).
- **Standard** (~50%)
- **Emerging** (~35%)

Tier assignment is stored per country with an editable rationale line (e.g. "Africa's largest diversified economy; critical supplier of platinum, chromium and gold") and a headline export-value figure in USD.

## geoNODE structure

Each country page gains a "Node" section modelled on the supplied geoNODE format. Fields left blank when data is not yet supplied:

- **Node ID / node type** (e.g. `Nigeria`, type `Country`), region link, capital link
- **Primary exports** — top 5 by value, each linking to its commodity node
- **SubNodes** — up to 15 ranked economic assets, each with its structured code and category, so they render as a typed list rather than free text. Categories: administrative region (`REG-`), state authority (`AUTH-`), port (`PORT-`), terminal (`TERM-`), mine (`MINE-`), canal (`CAN-`), pipeline (`PIPE-`), energy company (`ENGY-`), LNG facility (`LNG-`), chemical/fertiliser plant (`CHEM-`), automotive/aerospace cluster (`AUTO-`/`AERO-`), agri hub (`AGRI-`)
- SubNodes with known coordinates appear as secondary pins on the country's map view; the rest render as a categorised asset table.

## Commodity graph

A parallel commodity layer (`comNODE`) with its own pages at `/commodity/{slug}`, seeded with the top 10 supplied (crude oil, natural gas & LNG, gold, copper, cocoa beans, platinum group metals, diamonds, iron ore, phosphates, cobalt) and structured to hold all 50:

- HS4 code, category tag (energy, precious minerals, base metals, critical minerals, industrial minerals, agricultural products), African export value, global market value, Africa share %, estimated African reserves/production-potential value, YoY growth rate.
- **Top 5 African exporters**, ranked — each a link to that country page.

The link is bidirectional: a country page lists the commodities it exports (with its rank among African exporters), and a commodity page lists its top African exporters. Explore mode gains a commodity filter — pick a commodity and the map highlights only its exporting countries, graded by rank.

Country and commodity rows the user has not yet supplied are created with the identifying fields filled and the metrics blank, ready to receive data later. Blank fields render as a muted "—" with a "data pending" affordance, never as zero.


## Data

All data lives in the Lovable Cloud database so it can be edited and extended as you supply more.

- `countries` — slug, official name, common name, ISO codes, sub-region, centroid lat/lng, map zoom, flag emoji, tier, tier rationale, headline export value, capital, and all 13 indicators plus the structural parameter and a `data_notes` field.
- `country_subnodes` — country, asset code, name, category, rank, optional lat/lng.
- `commodities` — slug, name, HS4 code, category tags, African export value, global value, Africa share, reserves value, YoY growth.
- `country_commodities` — join table giving each country's exported commodities and each commodity's ranked top African exporters.
- Public read access only (anon SELECT); no user accounts in this build.
- The migration includes literal INSERT rows for all 54 sovereign nations and the seeded commodities, with unsupplied metrics left NULL.
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
