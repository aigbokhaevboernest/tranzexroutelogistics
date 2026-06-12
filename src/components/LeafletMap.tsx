import { useEffect, useRef } from "react";
import L from "leaflet";

type Pt = { lat: number; lng: number; label: string };
export type TransportMode = "land" | "air" | "sea";

const EMOJI: Record<string, string> = { land: "🚛", air: "✈️", sea: "🚢" };

function curveBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: TransportMode,
  segments = 64
): [number, number][] {
  if (mode === "land") return [[a.lat, a.lng], [b.lat, b.lng]];
  const points: [number, number][] = [];
  // perpendicular offset for curve depth
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const dist = Math.hypot(dx, dy) || 1;
  const depth = mode === "air" ? dist * 0.18 : dist * 0.12;
  const sign = mode === "sea" ? -1 : 1; // sea bends outward (south), air arcs up
  const px = -dy / dist;
  const py = dx / dist;
  const mx = (a.lng + b.lng) / 2 + px * depth * sign;
  const my = (a.lat + b.lat) / 2 + py * depth * sign;
  // air: arcs upward (positive lat); sea: bend opposite
  // Quadratic bezier
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * my + t * t * b.lat;
    const lng = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * mx + t * t * b.lng;
    points.push([lat, lng]);
  }
  return points;
}

export default function LeafletMap({
  origin,
  current,
  destination,
  transportMode = "land",
  status,
}: {
  origin?: Pt | null;
  current?: Pt | null;
  destination?: Pt | null;
  transportMode?: TransportMode | string;
  status?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const mode = ((transportMode || "land").toLowerCase() as TransportMode);
    const points = [origin, current, destination].filter(Boolean) as Pt[];
    if (points.length === 0) return;

    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(
      [points[0].lat, points[0].lng],
      4
    );

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const colors = { origin: "#22c55e", current: "#3b82f6", destination: "#ef4444" } as const;

    const addMarker = (p: Pt, color: string, pulse: boolean) => {
      const pulseHtml = pulse
        ? `<span class="absolute inset-0 rounded-full animate-ping" style="background:${color}55"></span>`
        : "";
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:18px;height:18px">${pulseHtml}<div style="position:relative;width:18px;height:18px;background:${color};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 4px ${color}55"></div></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindTooltip(
          `<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${color}"></span>${p.label}</span>`,
          { permanent: true, direction: "top", className: "custom-tooltip", offset: [0, -10] }
        );
    };

    if (origin) addMarker(origin, colors.origin, false);
    if (current) addMarker(current, colors.current, true);
    if (destination) addMarker(destination, colors.destination, false);

    let interval: ReturnType<typeof setInterval> | null = null;
    let travelerMarker: L.Marker | null = null;
    const isOnHold = (status || "").toLowerCase().includes("hold");
    const isMoving = !isOnHold && !!current;

    if (origin && destination) {
      // Completed path: origin -> current (solid bright)
      // Remaining path: current -> destination (dashed muted, animated)
      const startMid = current || destination;
      const completed = curveBetween(origin, startMid, mode);
      L.polyline(completed, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.95,
      }).addTo(map);

      if (current) {
        const remaining = curveBetween(current, destination, mode);
        L.polyline(remaining, {
          color: "#94a3b8",
          weight: 3,
          opacity: 0.75,
          dashArray: "8 10",
          className: "route-dash",
        }).addTo(map);
      }

      // Traveler emoji marker by transport mode
      const emoji = EMOJI[mode] || "🚛";
      const travelerIcon = L.divIcon({
        className: "",
        html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">${emoji}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const startLat = current ? current.lat : origin.lat;
      const startLng = current ? current.lng : origin.lng;
      travelerMarker = L.marker([startLat, startLng], { icon: travelerIcon }).addTo(map);

      if (isMoving && current) {
        // animate along remaining path
        const path = curveBetween(current, destination, mode, 120);
        let i = 0;
        interval = setInterval(() => {
          i = (i + 1) % path.length;
          travelerMarker?.setLatLng(path[i]);
        }, 80);
      }
    }

    const group = L.featureGroup(points.map((p) => L.marker([p.lat, p.lng])));
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 6 });

    return () => {
      if (interval) clearInterval(interval);
      map.remove();
    };
  }, [origin, current, destination, transportMode, status]);

  return <div ref={ref} className="w-full h-[420px] overflow-hidden" />;
}
