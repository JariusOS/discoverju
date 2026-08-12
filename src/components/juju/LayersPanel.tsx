import { Layers, X } from "lucide-react";
import { METRICS, type MetricKey } from "@/lib/juju-types";

export type FillKey = MetricKey | "export_value" | "tier" | "none";

const PROGRAMME: { key: FillKey; label: string }[] = [
  { key: "export_value", label: "Headline export value" },
  { key: "tier", label: "Tier classification" },
];

/** Floating "Layers" control plus the "Fill countries by" panel. */
export function LayersPanel({
  open,
  onOpenChange,
  fill,
  onFillChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fill: FillKey;
  onFillChange: (fill: FillKey) => void;
}) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="absolute top-3 right-3 z-20 flex items-center gap-2 border border-hairline bg-background/95 px-3 py-2 text-xs text-foreground backdrop-blur"
      >
        <Layers className="size-4" />
        Layers
      </button>
    );
  }

  const row = (key: FillKey, label: string, vintage?: string) => (
    <button
      key={key}
      type="button"
      onClick={() => {
        onFillChange(key);
        onOpenChange(false);
      }}
      className={`flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left text-sm transition-colors ${
        fill === key ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary/60"
      }`}
    >
      <span className="truncate">{label}</span>
      {vintage && <span className="numeral text-[11px] text-muted-foreground">{vintage}</span>}
    </button>
  );

  return (
    <div className="absolute inset-x-3 top-3 z-20 max-h-[70%] overflow-y-auto border border-hairline bg-background/97 backdrop-blur sm:right-3 sm:left-auto sm:w-80">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Layers className="size-4" />
          Fill countries by
        </p>
        <button type="button" onClick={() => onOpenChange(false)} aria-label="Close layers panel">
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      <p className="eyebrow px-3 pt-3 pb-1">Programme</p>
      {PROGRAMME.map((p) => row(p.key, p.label))}

      <p className="eyebrow px-3 pt-3 pb-1">Context</p>
      {METRICS.map((m) => row(m.key, m.label, m.vintage))}

      <p className="eyebrow px-3 pt-3 pb-1">Off</p>
      <div className="pb-2">{row("none", "No fill")}</div>
    </div>
  );
}
