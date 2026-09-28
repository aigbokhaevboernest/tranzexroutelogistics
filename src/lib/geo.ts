export type LatLng = { lat: number; lng: number };

// Great-circle distance in kilometers.
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Land progress: real percentage along the straight-line distance from
// origin to destination, based on where "current" actually sits. Returns
// undefined when there isn't enough data (falls back to step-based
// progress in the caller).
export function landProgressPercent(
  origin?: LatLng | null,
  current?: LatLng | null,
  destination?: LatLng | null
): number | undefined {
  if (!origin || !destination || !current) return undefined;
  const total = haversineKm(origin, destination);
  if (total <= 0) return 0;
  const done = haversineKm(origin, current);
  return Math.min(100, Math.max(0, (done / total) * 100));
}

// Air/sea progress: exactly four positions along the route, expressed as
// a percentage of the route distance — 0% origin, 25% departed, 50%
// in-flight/at-sea, 100% on hold or arrived+. On Hold sits at the
// destination end, not mid-route, per the shipment's real-world meaning
// (the vehicle stopped at/near its destination customs point).
export function airSeaProgressPercent(status: string | undefined, mode: "air" | "sea"): number {
  const s = (status || "").toLowerCase();
  if (s.includes("origin")) return 0;
  if (s.includes("depart")) return 25;
  if (mode === "air" && s.includes("flight")) return 50;
  if (mode === "sea" && s.includes("sea")) return 50;
  if (s.includes("hold")) return 100;
  if (s.includes("arrived") || s.includes("pick") || s.includes("deliver")) return 100;
  return 50;
}

// Formats a port/airport label as "CODE (Name)" when a code exists,
// otherwise just the name. Used for land (no code) vs air/sea (IATA or
// UN/LOCODE) so the same helper works everywhere the label is shown.
export function formatPortLabel(code?: string | null, name?: string | null): string {
  const n = (name || "").trim();
  const c = (code || "").trim();
  if (!n && !c) return "—";
  if (!c) return n || "—";
  if (!n) return c;
  return `${c} (${n})`;
}
