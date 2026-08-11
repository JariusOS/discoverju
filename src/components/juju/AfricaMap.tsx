import { useEffect, useRef, useState } from "react";
import { MAP_COLORS } from "./map-theme";
import type { CountrySummary, SubNode } from "@/lib/juju-types";

type AnyMap = Record<string, any>;

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  const w = window as unknown as AnyMap;
  if (w["google"]?.maps?.Map) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!key) {
      reject(new Error("Google Maps browser key is not configured"));
      return;
    }
    w["__jujuMapInit"] = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__jujuMapInit&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export type AfricaMapProps = {
  countries: CountrySummary[];
  selectedSlug?: string | null;
  onSelect?: (slug: string) => void;
  subnodes?: SubNode[];
  focus?: { lat: number; lng: number; zoom: number } | null;
  className?: string;
  mapTypeId?: "hybrid" | "satellite" | "terrain" | "roadmap";
  interactiveTilt?: boolean;
};

export function AfricaMap({
  countries,
  selectedSlug,
  onSelect,
  subnodes,
  focus,
  className,
  mapTypeId = "hybrid",
  interactiveTilt = true,
}: AfricaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AnyMap | null>(null);
  const markersRef = useRef<AnyMap[]>([]);
  const subMarkersRef = useRef<AnyMap[]>([]);
  const infoRef = useRef<AnyMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  onSelectRef.current = onSelect;

  // Boot the map once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const google = (window as unknown as AnyMap)["google"];
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat: 1.5, lng: 19 },
          zoom: 3,
          minZoom: 2,
          mapTypeId,
          tilt: interactiveTilt ? 45 : 0,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
          rotateControl: true,
          gestureHandling: "greedy",
          backgroundColor: MAP_COLORS.outline,
        });
        infoRef.current = new google.maps.InfoWindow();
        setStatus("ready");
      })
      .catch((error: Error) => {
        console.error(error);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Country markers.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const google = (window as unknown as AnyMap)["google"];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    countries.forEach((country) => {
      if (country.latitude === null || country.longitude === null) return;
      const isSelected = country.slug === selectedSlug;
      const marker = new google.maps.Marker({
        position: { lat: Number(country.latitude), lng: Number(country.longitude) },
        map: mapRef.current,
        title: country.common_name,
        zIndex: isSelected ? 999 : 1,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 10 : 6,
          fillColor: MAP_COLORS[country.tier],
          fillOpacity: 0.95,
          strokeColor: MAP_COLORS.outline,
          strokeWeight: isSelected ? 3 : 1.5,
        },
      });
      marker.addListener("click", () => {
        infoRef.current?.setContent(
          `<div style="font-family:'IBM Plex Sans',sans-serif;color:#141821;padding:2px 4px">
            <strong>${country.flag_emoji ?? ""} ${country.common_name}</strong><br/>
            <span style="font-size:12px">${country.subregion} · ${country.tier}</span>
          </div>`,
        );
        infoRef.current?.open({ anchor: marker, map: mapRef.current });
        onSelectRef.current?.(country.slug);
      });
      markersRef.current.push(marker);
    });
  }, [countries, selectedSlug, status]);

  // Sub-node (port / mine / hub) markers.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const google = (window as unknown as AnyMap)["google"];
    subMarkersRef.current.forEach((m) => m.setMap(null));
    subMarkersRef.current = [];

    (subnodes ?? []).forEach((node) => {
      if (node.latitude === null || node.longitude === null) return;
      const marker = new google.maps.Marker({
        position: { lat: Number(node.latitude), lng: Number(node.longitude) },
        map: mapRef.current,
        title: `${node.name} · ${node.category}`,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 4,
          fillColor: MAP_COLORS.subnode,
          fillOpacity: 1,
          strokeColor: MAP_COLORS.outline,
          strokeWeight: 1,
        },
      });
      marker.addListener("click", () => {
        infoRef.current?.setContent(
          `<div style="font-family:'IBM Plex Sans',sans-serif;color:#141821;padding:2px 4px">
            <strong>${node.name}</strong><br/><span style="font-size:12px">${node.category}</span>
          </div>`,
        );
        infoRef.current?.open({ anchor: marker, map: mapRef.current });
      });
      subMarkersRef.current.push(marker);
    });
  }, [subnodes, status]);

  // Camera moves.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !focus) return;
    mapRef.current["panTo"]({ lat: focus.lat, lng: focus.lng });
    mapRef.current["setZoom"](focus.zoom);
  }, [focus, status]);

  return (
    <div className={className ?? "h-full w-full"}>
      <div ref={containerRef} className="h-full w-full bg-secondary" />
      {status !== "ready" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="eyebrow">{status === "loading" ? "Loading satellite tiles…" : "Map unavailable"}</p>
        </div>
      )}
    </div>
  );
}
