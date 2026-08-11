import type { Tier } from "@/lib/juju-types";
import { TIER_LABEL } from "@/lib/juju-types";

const TIER_CLASS: Record<Tier, string> = {
  elite: "border-elite/50 text-elite",
  standard: "border-standard/50 text-standard",
  emerging: "border-emerging/50 text-emerging",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase ${TIER_CLASS[tier]}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
