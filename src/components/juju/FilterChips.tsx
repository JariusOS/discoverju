export type Chip = {
  value: string;
  label: string;
  /** Optional dot color utility class, e.g. "text-signal-cyan". */
  dotClass?: string;
};

export function FilterChips({
  chips,
  active,
  onChange,
  className,
}: {
  chips: Chip[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar flex gap-1.5 overflow-x-auto ${className ?? ""}`}>
      {chips.map((chip) => {
        const isActive = chip.value === active;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange(chip.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
              isActive
                ? "border-primary/70 bg-primary/10 text-primary"
                : "border-hairline text-muted-foreground hover:text-foreground"
            }`}
          >
            {chip.dotClass && <span className={`text-[9px] leading-none ${chip.dotClass}`}>●</span>}
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
