import { useEffect, useRef } from "react";
import L from "leaflet";

type Pt = { lat: number; lng: number; label: string };
export type TransportMode = "land" | "air" | "sea";
export type Checkpoint = {
  label: string;
  type: "customs" | "checkpoint";
  note?: string;
  lat?: number | null;
  lng?: number | null;
};

function isValidCoord(lat: any, lng: any): boolean {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

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

const MODE_COLORS: Record<TransportMode, string> = {
  land: "#ef4444",
  air: "#3b82f6",
  sea: "#92400e",
};

// Standalone filled icons, drawn facing RIGHT by default — no location pin.
// Plane: top-down artwork, rotated 90deg in the SVG itself so it faces
// right at rest. Truck/Ship: side-view artwork, already facing right.
function vehicleSvg(mode: TransportMode, color: string): string {
  const s = `width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"`;

  if (mode === "air") {
    return `<svg ${s}>
      <g transform="rotate(90 12 12)">
        <path fill="${color}" stroke="white" stroke-width="1"
          d="M12 2.5c.4 0 .8.2 1 .5l1.2 2.3 6.3 1.7c.7.2 1 1 .5 1.5l-4.8 4.2 1.5 6.5c.2.7-.5 1.3-1.1.9L12 17.3l-4.6 2.8c-.6.4-1.3-.2-1.1-.9l1.5-6.5-4.8-4.2c-.5-.5-.2-1.3.5-1.5l6.3-1.7L11 3c.2-.3.6-.5 1-.5z"/>
      </g>
    </svg>`;
  }

  if (mode === "sea") {
    return `<svg ${s}>
      <path fill="${color}" stroke="white" stroke-width="1" stroke-linejoin="round"
        d="M3 14h17l-1.5 3.5H5.5L3 14z"/>
      <path fill="${color}" stroke="white" stroke-width="1" stroke-linejoin="round"
        d="M6 14V9h3v5M10 14V7h5l2 3v4"/>
      <path fill="none" stroke="white" stroke-width="1.2" stroke-linecap="round"
        d="M4 18.5c1.5 1 3 1.5 5 1.5s3.5-.5 5-1.5 3-1.5 5-1.5"/>
    </svg>`;
  }

  return `<svg ${s}>
    <rect x="2" y="8" width="12" height="7" rx="1" fill="${color}" stroke="white" stroke-width="1"/>
    <path fill="${color}" stroke="white" stroke-width="1" stroke-linejoin="round"
      d="M14 10h4l3 3v2h-7V10z"/>
    <circle cx="6.5" cy="16.5" r="1.8" fill="${color}" stroke="white" stroke-width="1"/>
    <circle cx="16.5" cy="16.5" r="1.8" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="15" y="11" width="2.5" height="2" fill="white" opacity="0.9"/>
  </svg>`;
}

// Customs = amber shield with checkmark. Checkpoint = gray flag.
function checkpointSvg(type: "customs" | "checkpoint"): string {
  if (type === "customs") {
    return `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 5V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V5L12 2Z" fill="#f59e0b" stroke="white" stroke-width="1"/>
      <path d="M9 12L11 14L15 10" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="3" x2="5" y2="21" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    <path d="M5 4H18L15 8L18 12H5V4Z" fill="#64748b"/>
  </svg>`;
}

// Carto requires ?key= (not api_key). Hardcoded here so it works with no
// Vercel env var and no build-time injection step.
const CARTO_KEY = "cb1_3uok_1_f6d3991685906b9cf3d2e547";
const CARTO_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=" + CARTO_KEY;
const OSM_FALLBACK_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function LeafletMap({
  origin,
  current,
  destination,
  transportMode = "land",
  status,
  checkpoints = [],
}: {
  origin?: Pt | null;
  current?: Pt | null;
  destination?: Pt | null;
  transportMode?: TransportMode | string;
  status?: string;
  checkpoints?: Checkpoint[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  const validOrigin = origin && isValidCoord(origin.lat, origin.lng) ? origin : null;
  const validCurrent = current && isValidCoord(current.lat, current.lng) ? current : null;
  const validDestination = destination && isValidCoord(destination.lat, destination.lng) ? destination : null;
  const validCheckpoints = checkpoints.filter((c) => isValidCoord(c.lat, c.lng));

  const hasAnyPoint = !!(validOrigin || validCurrent || validDestination);

  useEffect(() => {
    if (!ref.current || !hasAnyPoint) return;
    ensureStyles();
    const mode = ((transportMode || "land").toLowerCase() as TransportMode);
    const points = [validOrigin, validCurrent, validDestination].filter(Boolean) as Pt[];

    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(
      [points[0].lat, points[0].lng],
      4
    );

    const cartoLayer = L.tileLayer(CARTO_TILES, {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: '© OpenStreetMap, © CARTO',
    });
    cartoLayer.addTo(map);

    let fellBack = false;
    cartoLayer.on("tileerror", () => {
      if (fellBack) return;
      fellBack = true;
      map.removeLayer(cartoLayer);
      L.tileLayer(OSM_FALLBACK_TILES, {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
    });

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
          { permanent: false, direction: "top", className: "custom-tooltip", offset: [0, -10] }
        );
    };

    if (validOrigin) addStaticMarker(validOrigin, colors.origin);
    if (validDestination) addStaticMarker(validDestination, colors.destination);

    validCheckpoints.forEach((c) => {
      const ringColor = c.type === "customs" ? "#f59e0b" : "#64748b";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:white;border-radius:9999px;box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid ${ringColor}">${checkpointSvg(c.type)}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([c.lat as number, c.lng as number], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:12px;min-width:140px">
            <div style="font-weight:700;color:${c.type === "customs" ? "#b45309" : "#334155"};text-transform:uppercase;font-size:10px;letter-spacing:0.05em">${c.type}</div>
            <div style="font-weight:600;margin-top:2px">${c.label}</div>
            ${c.note ? `<div style="color:#64748b;margin-top:2px">${c.note}</div>` : ""}
          </div>`
        );
    });

    // Direction toward destination. Plane (top-down art) rotates using the
    // full compass bearing; truck/ship (side-view art, drawn facing right
    // at rest) only mirror horizontally when travel is westbound.
    const a = validCurrent || validOrigin;
    const b = validDestination || validCurrent;
    const dx = a && b ? b.lng - a.lng : 0;
    const dy = a && b ? b.lat - a.lat : 0;
    const bearingDeg = a && b ? (Math.atan2(dx, dy) * 180) / Math.PI : 0;
    const headingWest = dx < 0;

    if (validOrigin && validDestination) {
      const startMid = validCurrent || validDestination;
      const completed = curveBetween(validOrigin, startMid, mode);
      L.polyline(completed, { color: "#3b82f6", weight: 4, opacity: 0.95 }).addTo(map);

      if (validCurrent) {
        const remaining = curveBetween(validCurrent, validDestination, mode);
        L.polyline(remaining, {
          color: "#94a3b8",
          weight: 3,
          opacity: 0.75,
          dashArray: "8 10",
          className: "route-dash",
        }).addTo(map);
      }
    }

    if (validCurrent) {
      const finalColor = isOnHold ? "#f59e0b" : MODE_COLORS[mode];
      const ringClass = isOnHold ? "lm-pulse-ring hold" : "lm-pulse-ring";
      const iconSvg = vehicleSvg(mode, finalColor);
      // Plane artwork faces right at rest and needs the compass bearing,
      // adjusted by -90deg since "right" (east) is bearing 90.
      // Truck/ship artwork faces right at rest and just mirrors on X when
      // heading west — no rotation, so the vehicle body stays upright.
      const transform =
        mode === "air"
          ? `rotate(${bearingDeg - 90}deg)`
          : `scaleX(${headingWest ? -1 : 1})`;
      const html = `
        <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
          <div class="${ringClass}" style="background:${finalColor}66;"></div>
          <div style="position:relative;width:14px;height:14px;background:${finalColor};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 2px ${finalColor}88;"></div>
          <div style="position:absolute;left:50%;top:-30px;transform:translateX(-50%);width:32px;height:32px;pointer-events:none">
            <div style="width:100%;height:100%;transform:${transform};filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">${iconSvg}</div>
          </div>
        </div>`;
      const icon = L.divIcon({
        className: "",
        html,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      L.marker([validCurrent.lat, validCurrent.lng], { icon, interactive: false, keyboard: false })
        .addTo(map)
        .bindTooltip(
          `<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${finalColor}"></span>${validCurrent.label}</span>`,
          { permanent: true, direction: "top", className: "custom-tooltip", offset: [0, -30] }
        );
    }

    const boundsPoints = [
      ...points,
      ...validCheckpoints.map((c) => ({ lat: c.lat as number, lng: c.lng as number })),
    ];
    const group = L.featureGroup(boundsPoints.map((p) => L.marker([p.lat, p.lng])));
    map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 10 });

    const t = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(t);
      map.remove();
    };
  }, [validOrigin, validCurrent, validDestination, transportMode, status, checkpoints, hasAnyPoint]);

  if (!hasAnyPoint) {
    return (
      <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] flex items-center justify-center bg-[#e8eef3] text-sm text-muted-foreground px-6 text-center">
        Location data not available for this shipment.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full h-[240px] sm:h-[320px] md:h-[420px] overflow-hidden bg-[#e8eef3]"
    />
  );
}

export function MapLegend({ checkpoints = [] }: { checkpoints?: Checkpoint[] }) {
  const hasCustoms = checkpoints.some((c) => c.type === "customs");
  const hasCheckpoint = checkpoints.some((c) => c.type === "checkpoint");
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 text-[11px] sm:text-xs text-muted-foreground border-t border-border bg-secondary/50">
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Origin</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Destination</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Current</div>
      {hasCustoms && <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Customs</div>}
      {hasCheckpoint && <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> Checkpoint</div>}
    </div>
  );
}
