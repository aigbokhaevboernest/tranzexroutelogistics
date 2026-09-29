import { useEffect, useRef } from "react";
import L from "leaflet";
import { airSeaProgressPercent } from "@/lib/geo";

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

function straightLine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): [number, number][] {
  return [[a.lat, a.lng], [b.lat, b.lng]];
}

// Computes the quadratic-bezier control point for an air/sea route. The
// perpendicular offset direction is normalized so the curve always bows
// the same way (toward increasing latitude) regardless of whether the
// route runs east or west — this keeps the completed/remaining segments
// visually consistent instead of one bowing up and the other down.
function curveControlPoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: "air" | "sea"
) {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const dist = Math.hypot(dx, dy) || 1;
  const depth = mode === "air" ? dist * 0.18 : dist * 0.12;
  let px = -dy / dist;
  let py = dx / dist;
  if (py < 0) {
    px = -px;
    py = -py;
  }
  return {
    mx: (a.lng + b.lng) / 2 + px * depth,
    my: (a.lat + b.lat) / 2 + py * depth,
  };
}

function buildCurve(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: "air" | "sea",
  segments = 120
): [number, number][] {
  const { mx, my } = curveControlPoint(a, b, mode);
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * my + t * t * b.lat;
    const lng = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * mx + t * t * b.lng;
    points.push([lat, lng]);
  }
  return points;
}

// Fetches a real road-following route for land mode from OSRM's free
// public routing server (no API key required). Returns null on any
// failure/timeout so the caller falls back to a straight line — the map
// never breaks even if OSRM is briefly unavailable. This only ever runs
// for land; air/sea always use the curved great-circle-style path, never
// a road route.
async function fetchRoadRoute(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || !coords.length) return null;
    return coords.map((c: [number, number]) => [c[1], c[0]]);
  } catch (err) {
    console.warn("OSRM road route failed, using straight-line fallback:", err);
    return null;
  }
}

// Inject pulse keyframes + tooltip/hint styles once
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
    .leaflet-tooltip.lm-current-tooltip {
      padding: 2px 7px;
      font-size: 11px;
      line-height: 1.3;
    }
    .lm-touch-hint {
      position: absolute; inset: 0; z-index: 500;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,23,42,0.45); color: white;
      font-family: Inter, sans-serif; font-size: 13px; font-weight: 600;
      text-align: center; padding: 16px;
      opacity: 0; pointer-events: none;
      transition: opacity 180ms ease;
    }
    .lm-touch-hint.visible { opacity: 1; }
  `;
  document.head.appendChild(style);
}

// Single source of truth for mode color — the pulsing ring, the vehicle
// silhouette inside it, MapInfoBar's "Current Stop" marker, and
// MapLegend's "Current" dot all read from this same map, so they always
// stay in sync. Hold status overrides all of them to amber regardless of
// mode.
export const MODE_COLORS: Record<TransportMode, string> = {
  land: "#7c3aed",
  air: "#3b82f6",
  sea: "#92400e",
};
export const HOLD_COLOR = "#f59e0b";

function vehicleSvg(mode: TransportMode, color: string): string {
  const s = `width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"`;

    if (mode === "air") {
    // Bootstrap bi-airplane-engines-fill — solid, nose UP
    return `<svg width="26" height="26" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="white" stroke-width="0.5"
        d="M8 0c-.787 0-1.292.592-1.572 1.151A4.35 4.35 0 0 0 6 3v3.691l-2 1V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.191l-1.17.585A1.5 1.5 0 0 0 0 10.618V12a.5.5 0 0 0 .582.493l1.631-.272.313.937a.5.5 0 0 0 .948 0l.405-1.214 2.21-.369.375 2.253-1.318 1.318A.5.5 0 0 0 5.5 16h5a.5.5 0 0 0 .354-.854l-1.318-1.318.375-2.253 2.21.369.405 1.214a.5.5 0 0 0 .948 0l.313-.937 1.63.272A.5.5 0 0 0 16 12v-1.382a1.5 1.5 0 0 0-.83-1.342L14 8.691V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v.191l-2-1V3c0-.568-.14-1.271-.428-1.849C9.292.591 8.787 0 8 0"/>
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
  currentLabel,
}: {
  origin?: Pt | null;
  current?: Pt | null;
  destination?: Pt | null;
  transportMode?: TransportMode | string;
  status?: string;
  checkpoints?: Checkpoint[];
  /** Text-only label for the current position on air/sea modes, where the
   * marker's actual map position is computed from status rather than from
   * admin-entered coordinates. Falls back to current?.label if omitted. */
  currentLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const validOrigin = origin && isValidCoord(origin.lat, origin.lng) ? origin : null;
  const validCurrent = current && isValidCoord(current.lat, current.lng) ? current : null;
  const validDestination = destination && isValidCoord(destination.lat, destination.lng) ? destination : null;
  const validCheckpoints = checkpoints.filter((c) => isValidCoord(c.lat, c.lng));

  const mode = ((transportMode || "land").toLowerCase() as TransportMode);
  const hasAnyPoint = !!(
    validOrigin ||
    validCurrent ||
    validDestination ||
    (mode !== "land" && validOrigin && validDestination)
  );

  useEffect(() => {
    if (!ref.current || !hasAnyPoint) return;
    ensureStyles();
    let cancelled = false;
    const points = [validOrigin, validCurrent, validDestination].filter(Boolean) as Pt[];
    if (points.length === 0) return;

    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    }).setView([points[0].lat, points[0].lng], 4);

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

    // --- Locked map: require two fingers to pan on touch devices ---
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let hintTimeout: ReturnType<typeof setTimeout> | null = null;
    const showHint = () => {
      const el = hintRef.current;
      if (!el) return;
      el.classList.add("visible");
      if (hintTimeout) clearTimeout(hintTimeout);
      hintTimeout = setTimeout(() => el.classList.remove("visible"), 1100);
    };

    if (isTouchDevice) {
      map.dragging.disable();
      const container = ref.current;

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length >= 2) map.dragging.enable();
        else {
          map.dragging.disable();
          showHint();
        }
      };
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          e.preventDefault();
          map.dragging.enable();
        } else {
          map.dragging.disable();
        }
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) map.dragging.disable();
      };

      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchmove", onTouchMove, { passive: false });
      container.addEventListener("touchend", onTouchEnd, { passive: true });

      (map as any)._lmTouchCleanup = () => {
        container.removeEventListener("touchstart", onTouchStart);
        container.removeEventListener("touchmove", onTouchMove);
        container.removeEventListener("touchend", onTouchEnd);
        if (hintTimeout) clearTimeout(hintTimeout);
      };
    }

    const isOnHold = (status || "").toLowerCase().includes("hold");
    const colors = { origin: "#22c55e", destination: "#ef4444" } as const;

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

    let markerPoint: { lat: number; lng: number } | null = null;
    let headingWest = false;
    let bearingDeg = 0;

    if (mode === "land") {
      // Land: real road-following route via OSRM. Current marker sits at
      // the admin-set coordinates, unchanged.
      if (validOrigin && validDestination) {
        const startMid = validCurrent || validDestination;

        const fallbackCompleted = straightLine(validOrigin, startMid);
        const fallbackLine = L.polyline(fallbackCompleted, { color: "#3b82f6", weight: 4, opacity: 0.95 }).addTo(map);
        fetchRoadRoute(validOrigin, startMid).then((road) => {
          if (cancelled || !road) return;
          map.removeLayer(fallbackLine);
          L.polyline(road, { color: "#3b82f6", weight: 4, opacity: 0.95 }).addTo(map);
        });

        if (validCurrent) {
          const fallbackRemaining = straightLine(validCurrent, validDestination);
          const fallbackDash = L.polyline(fallbackRemaining, {
            color: "#94a3b8", weight: 3, opacity: 0.75, dashArray: "8 10", className: "route-dash",
          }).addTo(map);
          fetchRoadRoute(validCurrent, validDestination).then((road) => {
            if (cancelled || !road) return;
            map.removeLayer(fallbackDash);
            L.polyline(road, {
              color: "#94a3b8", weight: 3, opacity: 0.75, dashArray: "8 10", className: "route-dash",
            }).addTo(map);
          });
        }
      }

      if (validCurrent) {
        markerPoint = { lat: validCurrent.lat, lng: validCurrent.lng };
        const a = validCurrent || validOrigin;
        const b = validDestination || validCurrent;
        if (a && b) headingWest = b.lng - a.lng < 0;
      }
    } else if (validOrigin && validDestination) {
      // Air/sea: one continuous curve, current position computed purely
      // from status (0/25/50/100%) — admin-entered "current" coordinates
      // are never used for placement here, only its label text is.
      const pct = airSeaProgressPercent(status, mode as "air" | "sea");
      const t = pct / 100;
      const fullCurve = buildCurve(validOrigin, validDestination, mode as "air" | "sea", 120);
      const splitIdx = Math.max(0, Math.min(fullCurve.length - 1, Math.round(t * (fullCurve.length - 1))));

      if (splitIdx > 0) {
        L.polyline(fullCurve.slice(0, splitIdx + 1), { color: "#3b82f6", weight: 4, opacity: 0.95 }).addTo(map);
      }
      if (splitIdx < fullCurve.length - 1) {
        L.polyline(fullCurve.slice(splitIdx), {
          color: "#94a3b8", weight: 3, opacity: 0.75, dashArray: "8 10", className: "route-dash",
        }).addTo(map);
      }

      markerPoint = { lat: fullCurve[splitIdx][0], lng: fullCurve[splitIdx][1] };

      const dx = validDestination.lng - validOrigin.lng;
      const dy = validDestination.lat - validOrigin.lat;
      bearingDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
      headingWest = dx < 0;
    }

    if (markerPoint) {
      const ringColor = isOnHold ? HOLD_COLOR : MODE_COLORS[mode];
      const ringClass = isOnHold ? "lm-pulse-ring hold" : "lm-pulse-ring";
      const iconSvg = vehicleSvg(mode, ringColor);
      const transform =
        mode === "air" ? `rotate(${bearingDeg}deg)` : `scaleX(${headingWest ? -1 : 1})`
      const label =
        mode === "land"
          ? validCurrent?.label || currentLabel || "Current"
          : currentLabel || validCurrent?.label || "Current";
      const html = `
        <div style="position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center">
          <div class="${ringClass}" style="background:${ringColor}66;"></div>
          <div style="position:relative;width:14px;height:14px;background:${ringColor};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 2px ${ringColor}88;"></div>
          <div style="position:absolute;left:50%;top:-18px;transform:translateX(-50%);width:26px;height:26px;pointer-events:none">
            <div style="width:100%;height:100%;transform:${transform};filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">${iconSvg}</div>
          </div>
        </div>`;
      const icon = L.divIcon({ className: "", html, iconSize: [42, 42], iconAnchor: [21, 21] });
      L.marker([markerPoint.lat, markerPoint.lng], { icon, interactive: false, keyboard: false })
        .addTo(map)
        .bindTooltip(
          `<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${ringColor}"></span>${label}</span>`,
          { permanent: true, direction: "top", className: "custom-tooltip lm-current-tooltip", offset: [0, -46] }
        );
    }

    const boundsPoints = [
      ...(validOrigin ? [validOrigin] : []),
      ...(validDestination ? [validDestination] : []),
      ...(markerPoint ? [markerPoint] : []),
      ...validCheckpoints.map((c) => ({ lat: c.lat as number, lng: c.lng as number })),
    ];
    if (boundsPoints.length) {
      const group = L.featureGroup(boundsPoints.map((p) => L.marker([p.lat, p.lng])));
      map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 10 });
    }

    const t = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if ((map as any)._lmTouchCleanup) (map as any)._lmTouchCleanup();
      map.remove();
    };
  }, [validOrigin, validCurrent, validDestination, transportMode, status, checkpoints, hasAnyPoint, currentLabel]);

  if (!hasAnyPoint) {
    return (
      <div className="w-full h-[320px] sm:h-[400px] md:h-[520px] flex items-center justify-center bg-[#e8eef3] text-sm text-muted-foreground px-6 text-center">
        Location data not available for this shipment.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[520px] overflow-hidden bg-[#e8eef3]">
      <div ref={ref} className="w-full h-full" />
      <div ref={hintRef} className="lm-touch-hint">
        Use two fingers to move the map
      </div>
    </div>
  );
}

export function MapLegend({
  checkpoints = [],
  transportMode = "land",
  status,
}: {
  checkpoints?: Checkpoint[];
  transportMode?: string;
  status?: string;
}) {
  const mode = ((transportMode || "land").toLowerCase() as TransportMode);
  const isOnHold = (status || "").toLowerCase().includes("hold");
  const currentColor = isOnHold ? HOLD_COLOR : MODE_COLORS[mode];
  const hasCustoms = checkpoints.some((c) => c.type === "customs");
  const hasCheckpoint = checkpoints.some((c) => c.type === "checkpoint");
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 text-[11px] sm:text-xs text-muted-foreground border-t border-border bg-secondary/50">
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Origin</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: currentColor }} /> Current</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Destination</div>
      {hasCustoms && <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Customs</div>}
      {hasCheckpoint && <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> Checkpoint</div>}
    </div>
  );
}
