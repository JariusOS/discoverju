import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Columns3,
  FileText,
  Flag,
  Globe2,
  Map as MapIcon,
  RefreshCw,
  Boxes,
} from "lucide-react";
import type { ReactNode } from "react";
import { StatGrid } from "./StatGrid";
import { commoditiesQuery, countriesQuery } from "@/lib/juju-queries";
import { fmtCompact, fmtUsd } from "@/lib/juju-format";

const TABS = [
  { to: "/", label: "Map", icon: MapIcon },
  { to: "/regions", label: "Regions", icon: BarChart3 },
  { to: "/countries", label: "Countries", icon: Flag },
  { to: "/commodities", label: "Commodities", icon: Boxes },
  { to: "/compare", label: "Compare", icon: Columns3 },
  { to: "/intel", label: "Intel", icon: FileText },
] as const;

function LogoMark() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <span className="size-3.5 rounded-full border-2 border-foreground" />
      <span className="-ml-2 size-3.5 rounded-full bg-foreground" />
    </span>
  );
}

function ContinentalStats() {
  const countries = useQuery(countriesQuery);
  const commodities = useQuery(commoditiesQuery);

  const list = countries.data ?? [];
  const gdp = list.reduce((s, c) => s + Number(c.gdp_nominal_usd ?? 0), 0);
  const pop = list.reduce((s, c) => s + Number(c.total_population ?? 0), 0);
  const exports = (commodities.data ?? []).reduce((s, c) => s + Number(c.african_export_value_usd ?? 0), 0);
  const elite = list.filter((c) => c.tier === "elite").length;

  return (
    <StatGrid
      stats={[
        {
          label: "Nations",
          value: list.length ? list.length : "—",
          caption: `${elite} elite tier · 5 sub-regions`,
          icon: <Globe2 className="size-3" />,
        },
        {
          label: "Combined GDP",
          value: gdp ? fmtUsd(gdp) : "—",
          caption: "nominal, current USD",
        },
        {
          label: "Population",
          value: pop ? fmtCompact(pop) : "—",
          caption: "latest national baselines",
        },
        {
          label: "Tracked exports",
          value: exports ? fmtUsd(exports) : "—",
          caption: `${commodities.data?.length ?? 0} commodity lines / yr`,
        },
      ]}
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const isMap = pathname === "/";

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-sm tracking-tight text-foreground sm:text-base">Juju Africa</span>
        </Link>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          aria-label="Refresh data"
          className="ml-auto flex size-9 items-center justify-center border border-hairline text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-4" />
        </button>
      </header>

      <div className="shrink-0">
        <ContinentalStats />
      </div>

      {/* Required: nested routes render here. */}
      <main className={`min-h-0 flex-1 ${isMap ? "relative overflow-hidden" : "overflow-y-auto"}`}>
        {children}
      </main>

      <nav className="no-scrollbar flex shrink-0 overflow-x-auto border-t border-hairline">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.to === "/" }}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{
              className:
                "flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] tracking-wide text-foreground border-t-2 border-primary -mt-px",
            }}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
