import { useEffect, useRef } from "react";
import L from "leaflet";

type Pt = { lat: number; lng: number; label: string };
export type TransportMode = "land" | "air" | "sea";

// Inline SVG icon paths (lucide-style), replacing the emoji markers.
// Each is drawn pointing "up" (north) by default, then rotated via bearingDeg
// to face the actual direction of travel along the route.
const ICON_SVG: Record<TransportMode, string> = {
  land: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l4 4v4h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  air: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.4 5.8c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  sea: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.53 7.24"/><path d="M19 13V7a2 2 0 0 0-2-2h-3"/><path d="M12 10V4a1 1 0 0 0-1-1H8.3a1 1 0 0 0-.9.6L6 7"/></svg>`,
};

const EMOJI: Record<string, string> = { land: "🚛", air: "✈️", sea: "🚢" };

function curveBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: TransportMode,
  segments = 64
): [number, number][] {
  if (mode === "land") return [[a.lat, a.lng], [b.lat, b.lng]];
  const points: [number, number][] = [];
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const dist = Math.hypot(dx, dy) || 1;
  const depth = mode === "air" ? dist * 0.18 : dist * 0.12;
  const sign = mode === "sea" ? -1 : 1;
  const px = -dy / dist;
  const py = dx / dist;
  const mx = (a.lng + b.lng) / 2 + px * depth * sign;
  const my = (a.lat + b.lat) / 2 + py * depth * sign;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * my + t * t * b.lat;
    const lng = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * mx + t * t * b.lng;
    points.push([lat, lng]);
  }
  return points;
}

const STYLE_ID = "leaflet-pulse-styles";
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes lm-pulse-normal {
      0% { transform: scale(0.6); opacity: 0.85; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes lm-pulse-hold {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(3.4); opacity: 0; }
    }
    .lm-pulse-ring {
      position: absolute; inset: 0; border-radius: 9999px;
      animation: lm-pulse-normal 1.8s ease-out infinite;
    }
    .lm-pulse-ring.hold {
      animation: lm-pulse-hold 0.9s ease-out infinite;
    }
  `;
  document.head.appendChild(style);
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
    ensureStyles();
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

    const isOnHold = (status || "").toLowerCase().includes("hold");
    const colors = {
      origin: "#22c55e",
      current: isOnHold ? "#f59e0b" : "#3b82f6",
      destination: "#ef4444",
    } as const;

    const addStaticMarker = (p: Pt, color: string) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:18px;height:18px"><div style="position:relative;width:18px;height:18px;background:${color};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 4px ${color}55"></div></div>`,
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

    if (origin) addStaticMarker(origin, colors.origin);
    if (destination) addStaticMarker(destination, colors.destination);

    // Compute bearing from current toward destination (or origin toward destination)
    const bearingDeg = (() => {
      const a = current || origin;
      const b = destination || current;
      if (!a || !b) return 0;
      const dx = b.lng - a.lng;
      const dy = b.lat - a.lat;
      const rad = Math.atan2(dx, dy);
      return (rad * 180) / Math.PI;
    })();

    if (origin && destination) {
      const startMid = current || destination;
      const completed = curveBetween(origin, startMid, mode);
      L.polyline(completed, { color: "#3b82f6", weight: 4, opacity: 0.95 }).addTo(map);

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
    }

    // Pinned current-stop marker: pulse ring + dot + SVG icon, rotated to face travel direction
    if (current) {
      const svg = ICON_SVG[mode] || ICON_SVG.land;
      const ringColor = isOnHold ? "#f59e0b" : "#3b82f6";
      const ringClass = isOnHold ? "lm-pulse-ring hold" : "lm-pulse-ring";
      const html = `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
          <div class="${ringClass}" style="background:${ringColor}66;"></div>
          <div style="position:relative;width:14px;height:14px;background:${ringColor};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 2px ${ringColor}88;"></div>
          <div style="position:absolute;left:50%;top:-22px;transform:translateX(-50%) rotate(${bearingDeg}deg);transform-origin:50% 100%;color:${ringColor};filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));pointer-events:none">${svg}</div>
        </div>`;
      const icon = L.divIcon({
        className: "",
        html,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      L.marker([current.lat, current.lng], { icon, interactive: false, keyboard: false })
        .addTo(map)
        .bindTooltip(
          `<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${ringColor}"></span>${current.label}</span>`,
          { permanent: true, direction: "top", className: "custom-tooltip", offset: [0, -22] }
        );
    }

    const group = L.featureGroup(points.map((p) => L.marker([p.lat, p.lng])));
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 6 });

    return () => {
      map.remove();
    };
  }, [origin, current, destination, transportMode, status]);

  return 
