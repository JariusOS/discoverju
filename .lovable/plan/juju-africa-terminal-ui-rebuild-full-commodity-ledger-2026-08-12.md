# Juju Africa — terminal UI rebuild + full commodity ledger

## Two parts

1. Rebuild the interface in the style of the reference screenshots: monospace, near-black, dense data-terminal layout with a persistent stat header, filter chips, choropleth map with a Layers panel, and a bottom tab bar.
2. Load the full commodity ledger you supplied (54 entries with HS codes, African export value, global market, Africa share, reserves/potential value, YoY growth, category tags and top-5 exporters). Currently only 18 commodities exist and only 10 are ranked.

## Part 1 — UI direction

Look and feel, taken from the references:
- Monospace everywhere (IBM Plex Mono as the primary UI face), tight hairline dividers, black/near-black surfaces, small uppercase labels above large numerals.
- Accent set kept from the existing tier palette (ochre/ember) with cyan / violet / magenta / green category dots for tags, as in the reference chips.
- Sticky top bar: logo mark + "Juju Africa" + account and refresh buttons.
- Sticky 2x2 stat grid under the header, always visible: nations, combined GDP, population, tracked export value (with a small caption line under each, e.g. "of 54 sovereign states").
- Bottom tab bar as the primary navigation (mobile-first, becomes a left rail on desktop): Map, Regions, Countries, Commodities, Compare, Intel.

Screens:
- **Map** (replaces the current split Explore): full-bleed map, choropleth fill of the 54 countries driven by a selected indicator, proportional bubbles for export value, floating "Layers" button opening a "Fill countries by" panel (indicator list with vintage years + "No fill"), a scale bar and zoom controls, and a bottom sheet for the tapped country.
- **Regions**: the five sub-regions as ranked bars with a metric toggle (GDP / Population / Export value / Per capita), each row showing share and a secondary caption; tap a row to filter everything else.
- **Countries**: search field + tier and sub-region chips, then a dense record list (flag, name, tier dot, sub-region, headline indicator). Country detail pages keep the 13-parameter architecture but restyled to the new mono/stat-grid system.
- **Commodities**: the same record-list treatment over the 54-row ledger, with category chips (Energy, Precious, Critical, Base metals, Industrial, Agricultural, Forest, Marine, Special), sortable by value / Africa share / YoY. Commodity detail restyled with a stat grid and ranked exporter list.
- **Compare**: pick 2-4 countries side by side across the 13 indicators.
- **Intel**: definitions, tier methodology, data vintages and blank-field notes.

## Part 2 — Commodity data

One database migration that:
- Adds columns for the potential/reserve label variants you use ("Est. African Reserves Value", "Arable Potential Value", "Processing Value Potential", etc. — stored as a label + value pair, which already exists) and a `growth_note` text column for the entries where YoY is prose rather than a percentage (Tungsten, Fluorspar, Limestone, Maize).
- Upserts all 54 commodities by slug with rank, HS code, category tags, African export value, global market value, Africa share, reserves/potential value + label, and YoY growth.
- Rewrites `country_commodities` exporter links so each commodity carries its top-5 exporters in your stated order (ranks 1-5), matching country names including Côte d'Ivoire, DR Congo, Eswatini, Guinea-Bissau, Comoros.
- Existing rows that are not in your list (motor vehicles, garments/textiles, aerospace components, nitrogenous fertilisers) are removed so the ledger matches your 54 exactly.

## Technical notes

- Styling stays token-driven in `src/styles.css`: new mono-first type scale, `--color-*` additions for the category dot colors, no hardcoded color utilities.
- New shell components: `AppShell` (top bar + sticky stat grid + bottom tab bar), `StatGrid`, `RecordRow`, `FilterChips`, `LayersPanel`, `BottomSheet`.
- The map upgrade needs country polygons for choropleth fill. Google Maps has no built-in Africa admin-0 boundaries, so the fill layer loads a lightweight GeoJSON of African country outlines and renders it as a data layer keyed by ISO3, tinted from the selected indicator. Bubbles and node markers stay as they are.
- Routes: `/` becomes the Map screen, with `/regions`, `/countries`, `/commodities`, `/compare`, `/intel` and the existing `/country/$slug` and `/commodity/$slug` details. The old `/search` and `/explore` paths redirect to `/countries` and `/`.
- Each route keeps its own `head()` metadata.
