import { useEffect, useRef } from "react";
import L from "leaflet";

type Pt = { lat: number; lng: number; label: string };
export type TransportMode = "land" | "air" | "sea";

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

// Direction-aware vehicle glyphs — each drawn "nose up" (pointing north /
// 0deg) so the same rotate(${bearingDeg}deg) transform used for the marker
// correctly points the vehicle along the route in every direction.
function vehicleSvg(mode: TransportMode, color: string): string {
  const common = `width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"`;

  if (mode === "air") {
    return `<svg ${common}>
      <path d="M12 1.5L13.4 8.5L21.5 11.5L13.6 12.6L14.8 21L12 18.2L9.2 21L10.4 12.6L2.5 11.5L10.6 8.5L12 1.5Z" fill="${color}" stroke="white" stroke-width="0.75" stroke-linejoin="round"/>
    </svg>`;
  }

  if (mode === "sea") {
    return `<svg ${common}>
      <path d="M12 2L15.2 10.5H8.8L12 2Z" fill="${color}" stroke="white" stroke-width="0.75" stroke-linejoin="round"/>
      <rect x="10" y="10.5" width="4" height="6" fill="${color}" stroke="white" stroke-width="0.75"/>
      <path d="M3.5 18C6 20.3 9 21.5 12 21.5C15 21.5 18 20.3 20.5 18L18.5 15.8H5.5L3.5 18Z" fill="${color}" stroke="white" stroke-width="0.75" stroke-linejoin="round"/>
    </svg>`;
  }

  return `<svg ${common}>
    <path d="M12 1.5L15 8.5H9L12 1.5Z" fill="${color}" stroke="white" stroke-width="0.75" stroke-linejoin="round"/>
    <rect x="7.5" y="8.5" width="9" height="10.5" rx="1.5" fill="${color}" stroke="white" stroke-width="0.75"/>
    <circle cx="9.5" cy="20.5" r="1.6" fill="${color}" stroke="white" stroke-width="0.75"/>
    <circle cx="14.5" cy="20.5" r="1.6" fill="${color}" stroke="white" stroke-width="0.75"/>
  </svg>`;
}

// Carto requires ?key= (not api_key). Hardcoded here so it works with no
// Vercel env var and no build-time injection step.
const CARTO_KEY = "cb1_3uok_1_f6d3991685906b9cf3d2e547";
const CARTO_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key="cb1_3uok_1_f6d3991685906b9cf3d2e547;

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

    L.tileLayer(CARTO_TILES, {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: '© OpenStreetMap, © CARTO',
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

    if (current) {
      const ringColor = isOnHold ? "#f59e0b" : "#3b82f6";
      const ringClass = isOnHold ? "lm-pulse-ring hold" : "lm-pulse-ring";
      const iconSvg = vehicleSvg(mode, ringColor);
      const html = `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
          <div class="${ringClass}" style="background:${ringColor}66;"></div>
          <div style="position:relative;width:14px;height:14px;background:${ringColor};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 2px ${ringColor}88;"></div>
          <div style="position:absolute;left:50%;top:-24px;transform:translateX(-50%) rotate(${bearingDeg}deg);transform-origin:50% 100%;width:24px;height:24px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));pointer-events:none">${iconSvg}</div>
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
