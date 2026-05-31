import { useEffect, useRef } from "react";
import L from "leaflet";

type Pt = { lat: number; lng: number; label: string };

export default function LeafletMap({
  origin,
  current,
  destination,
}: {
  origin?: Pt | null;
  current?: Pt | null;
  destination?: Pt | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const points = [origin, current, destination].filter(Boolean) as Pt[];
    if (points.length === 0) return;

    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(
      [points[0].lat, points[0].lng],
      4
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const colors = { origin: "#22c55e", current: "#3b82f6", destination: "#ef4444" } as const;

    const addMarker = (p: Pt, color: string) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="pulse-marker" style="color:${color};width:18px;height:18px;background:${color};border:3px solid white;border-radius:9999px;box-shadow:0 0 0 4px ${color}55"></div>`,
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

    if (origin) addMarker(origin, colors.origin);
    if (current) addMarker(current, colors.current);
    if (destination) addMarker(destination, colors.destination);

    let interval: ReturnType<typeof setInterval> | null = null;
    let travelerMarker: L.Marker | null = null;
    if (origin && destination) {
      const latlngs: L.LatLngExpression[] = current
        ? [[origin.lat, origin.lng], [current.lat, current.lng], [destination.lat, destination.lng]]
        : [[origin.lat, origin.lng], [destination.lat, destination.lng]];

      L.polyline(latlngs, {
        color: "#7dd3fc",
        weight: 3,
        dashArray: "10 10",
        className: "route-dash",
      }).addTo(map);

      let t = 0;
      const travelerIcon = L.divIcon({
        className: "",
        html: `<div style="font-size:22px;line-height:1">🚚</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      travelerMarker = L.marker([origin.lat, origin.lng], { icon: travelerIcon }).addTo(map);

      const interp = (a: number, b: number, k: number) => a + (b - a) * k;
      interval = setInterval(() => {
        t = (t + 0.01) % 1;
        const segs = current ? 2 : 1;
        const local = (t * segs) % 1;
        const segIdx = Math.floor(t * segs);
        const a = segIdx === 0 ? origin : current!;
        const b = segIdx === 0 && current ? current : destination;
        travelerMarker?.setLatLng([interp(a.lat, b.lat, local), interp(a.lng, b.lng, local)]);
      }, 80);
    }

    const group = L.featureGroup(points.map((p) => L.marker([p.lat, p.lng])));
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 6 });

    return () => {
      if (interval) clearInterval(interval);
      map.remove();
      mapRef.current = null;
    };
  }, [origin, current, destination]);

  return <div ref={ref} className="w-full h-[420px] overflow-hidden" />;
}
