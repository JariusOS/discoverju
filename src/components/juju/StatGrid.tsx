import type { ReactNode } from "react";

export type Stat = {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
};

/** Persistent 2x2 readout grid, hairline-divided like a trading terminal. */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 border-b border-hairline">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-4 py-3 ${i % 2 === 0 ? "border-r border-hairline" : ""} ${
            i < stats.length - 2 ? "border-b border-hairline" : ""
          }`}
        >
          <p className="eyebrow flex items-center gap-1.5">
            {stat.icon}
            {stat.label}
          </p>
          <p className="readout mt-1 truncate">{stat.value}</p>
          {stat.caption && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{stat.caption}</p>}
        </div>
      ))}
    </div>
  );
}
