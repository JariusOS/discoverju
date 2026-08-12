import { useEffect, useRef, useState } from "react";
import { MAP_COLORS } from "./map-theme";
import type { CountrySummary, SubNode } from "@/lib/juju-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMap = any;

const GEOJSON_URL = "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json";

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
  /** ISO3 -> hex fill color for the choropleth layer. Empty object = no fill. */
  fillByIso3?: Record<string, string>;
  /** Slug -> 0..1 magnitude driving proportional bubble radius. */
  bubbleScale?: Record<string, number>;
};

export function AfricaMap({
  countries,
  selectedSlug,
  onSelect,
  subnodes,
  focus,
  className,
  mapTypeId = "roadmap",
  fillByIso3,
  bubbleScale,
}: AfricaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AnyMap | null>(null);
  const markersRef = useRef<AnyMap[]>([]);
  const subMarkersRef = useRef<AnyMap[]>([]);
  const infoRef = useRef<AnyMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const fillRef = useRef<Record<string, string>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  onSelectRef.current = onSelect;
  fillRef.current = fillByIso3 ?? {};

  // Boot the map once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const google = (window as unknown as AnyMap)["google"];
        const map = new google.maps.Map(containerRef.current, {
          center: { lat: 3, lng: 19 },
          zoom: 3,
          minZoom: 2,
          mapTypeId,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          rotateControl: false,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: MAP_COLORS.outline,
          styles: MAP_STYLE,
        });
        mapRef.current = map;
        infoRef.current = new google.maps.InfoWindow();

        map.data.setStyle((feature: AnyMap) => {
          const iso3 = String(feature.getId() ?? "");
          const color = fillRef.current[iso3];
          return {
            fillColor: color ?? MAP_COLORS.landless,
            fillOpacity: color ? 0.72 : 0,
            strokeColor: MAP_COLORS.borderline,
            strokeWeight: 0.6,
            clickable: false,
          };
        });
        map.data.loadGeoJson(GEOJSON_URL, { idPropertyName: "id" });

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

  // Re-tint the choropleth whenever the fill layer changes.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    mapRef.current.data.forEach((feature: AnyMap) => {
      mapRef.current.data.overrideStyle(feature, {});
    });
    mapRef.current.data.setStyle((feature: AnyMap) => {
      const iso3 = String(feature.getId() ?? "");
      const color = fillRef.current[iso3];
      return {
        fillColor: color ?? MAP_COLORS.landless,
        fillOpacity: color ? 0.72 : 0,
        strokeColor: MAP_COLORS.borderline,
        strokeWeight: 0.6,
        clickable: false,
      };
    });
  }, [fillByIso3, status]);

  // Country markers / proportional bubbles.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const google = (window as unknown as AnyMap)["google"];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    countries.forEach((country) => {
      if (country.latitude === null || country.longitude === null) return;
      const isSelected = country.slug === selectedSlug;
      const magnitude = bubbleScale?.[country.slug];
      const scale =
        magnitude === undefined ? (isSelected ? 9 : 5.5) : 5 + Math.sqrt(magnitude) * 20 + (isSelected ? 3 : 0);

      const marker = new google.maps.Marker({
        position: { lat: Number(country.latitude), lng: Number(country.longitude) },
        map: mapRef.current,
        title: country.common_name,
        zIndex: isSelected ? 999 : Math.round((magnitude ?? 0) * 100) + 1,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale,
          fillColor: MAP_COLORS[country.tier],
          fillOpacity: 0.75,
          strokeColor: isSelected ? MAP_COLORS.selected : MAP_COLORS.bubbleStroke,
          strokeWeight: isSelected ? 3 : 1.5,
        },
      });
      marker.addListener("click", () => {
        onSelectRef.current?.(country.slug);
      });
      markersRef.current.push(marker);
    });
  }, [countries, selectedSlug, status, bubbleScale]);

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
          `<div style="font-family:'IBM Plex Mono',monospace;color:#141821;padding:2px 4px">
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
          <p className="eyebrow">{status === "loading" ? "Loading map tiles…" : "Map unavailable"}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Dark basemap. Google Maps rasterizes its own tiles and cannot read CSS
 * custom properties, so these hex values mirror the design tokens.
 */
const MAP_STYLE: AnyMap = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b93" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#121214" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3a3a40" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9c9ca4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e10" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#55555c" }] },
];
