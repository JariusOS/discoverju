/**
 * Map-graphic palette. Google Maps rasterizes marker fills itself and cannot
 * resolve CSS custom properties, so these hex values mirror the design tokens
 * (--elite / --standard / --emerging / --primary) for canvas use only.
 * Do not use them for DOM styling — use the semantic Tailwind tokens there.
 */
export const MAP_COLORS = {
  elite: "#e9b64a",
  standard: "#5aa7c4",
  emerging: "#57bd8f",
  subnode: "#d97449",
  outline: "#141821",
} as const;
