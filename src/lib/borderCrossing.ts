import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";

let boundariesCache: FeatureCollection | null = null;

async function loadBoundaries(): Promise<FeatureCollection | null> {
  if (boundariesCache) return boundariesCache;
  try {
    const res = await fetch("/countries.geo.json");
    if (!res.ok) return null;
    const data = await res.json();
    boundariesCache = data;
    return data;
  } catch {
    return null;
  }
}

function countryForPoint(pt: [number, number], boundaries: FeatureCollection): Feature | null {
  const point = turf.point(pt);
  for (const feature of boundaries.features) {
    try {
      if (turf.booleanPointInPolygon(point, feature as Feature<Polygon | MultiPolygon>)) {
        return feature;
      }
    } catch {
      // skip malformed geometries in the dataset
    }
  }
  return null;
}

export type BorderCrossing = {
  lat: number;
  lng: number;
  fromCountry: string;
  toCountry: string;
};

/**
 * Given an origin and destination point, finds where the straight route
 * line crosses from the origin's country into the destination's country.
 * Returns null if either point can't be matched to a country, or if both
 * points are in the same country (no border crossing).
 */
export async function findBorderCrossing(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<BorderCrossing | null> {
  const boundaries = await loadBoundaries();
  if (!boundaries) return null;

  const originFeature = countryForPoint([origin.lng, origin.lat], boundaries);
  const destFeature = countryForPoint([destination.lng, destination.lat], boundaries);
  if (!originFeature || !destFeature) return null;

  const originName =
    (originFeature.properties as any)?.name ?? (originFeature.properties as any)?.ADMIN ?? "Origin Country";
  const destName =
    (destFeature.properties as any)?.name ?? (destFeature.properties as any)?.ADMIN ?? "Destination Country";
  if (originName === destName) return null;

  const line = turf.lineString([
    [origin.lng, origin.lat],
    [destination.lng, destination.lat],
  ]);

  let boundaryLine;
  try {
    boundaryLine = turf.polygonToLine(destFeature as any);
  } catch {
    return null;
  }

  const intersections = turf.lineIntersect(line as any, boundaryLine as any);
  if (!intersections.features.length) return null;

  // If the line clips the destination country's outline more than once,
  // take the crossing point closest to the origin — that's the entry point.
  const originPt = turf.point([origin.lng, origin.lat]);
  let closest = intersections.features[0];
  let closestDist = turf.distance(originPt, closest, { units: "kilometers" });
  for (const f of intersections.features.slice(1)) {
    const d = turf.distance(originPt, f, { units: "kilometers" });
    if (d < closestDist) {
      closest = f;
      closestDist = d;
    }
  }

  const [lng, lat] = closest.geometry.coordinates as [number, number];
  return { lat, lng, fromCountry: originName, toCountry: destName };
}
