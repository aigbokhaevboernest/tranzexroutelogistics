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

// Inject pulse keyframes once
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
      // Map screen: +lng = right, +lat = up. We want 0deg = up (north).
      const dx = b.lng - a.lng;
      const dy = b.lat - a.lat;
      // atan2(dx, dy) gives angle clockwise from north
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

    // Pinned current-stop marker: pulse ring + dot + emoji, all anchored at current
    if (current) {
      const emoji = EMOJI[mode] || "🚛";
      const ringColor = isOnHold ? "#f59e0b" : "#3b82f6";
      const ringClass = isOnHold ? "lm-pulse-ring hold" : "lm-pulse-ring";
      const html = `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
          <div class="${ringClass}" style="background:${ringColor}66;"></div>
          <div style="position:relative;width:14px;height:14px;background:${ringColor};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 2px ${ringColor}88;"></div>
          <div style="position:absolute;left:50%;top:-22px;transform:translateX(-50%) rotate(${bearingDeg}deg);transform-origin:50% 100%;font-size:22px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));pointer-events:none">${emoji}</div>
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

  return <div ref={ref} className="w-full h-[420px] overflow-hidden" />;
}
