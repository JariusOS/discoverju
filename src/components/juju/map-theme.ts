/**
 * Map-graphic palette. Google Maps rasterizes tiles and marker fills itself and
 * cannot resolve CSS custom properties, so these hex values mirror the design
 * tokens (--elite / --standard / --emerging / --primary) for canvas use only.
 * Do not use them for DOM styling — use the semantic Tailwind tokens there.
 */
export const MAP_COLORS = {
  elite: "#e9b64a",
  standard: "#5aa7c4",
  emerging: "#57bd8f",
  subnode: "#d97449",
  outline: "#141821",
  landless: "#2a2a2e",
  borderline: "#4a4a52",
  bubbleStroke: "#f2f2f4",
  selected: "#f0b850",
} as const;

/** Low → high ramp for choropleth fills, mirroring the ochre accent. */
export const FILL_RAMP = ["#2f2b26", "#5a4a2c", "#8a6a2c", "#b98a2e", "#e0a33c"] as const;

export function rampColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const idx = Math.min(FILL_RAMP.length - 1, Math.floor(clamped * FILL_RAMP.length));
  return FILL_RAMP[idx] ?? FILL_RAMP[0];
}
