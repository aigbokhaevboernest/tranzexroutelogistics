export type TransportMode = "land" | "air" | "sea";

const MODE_META: Record<TransportMode, { emoji: string; label: string; originLabel: string; destLabel: string }> = {
  land: { emoji: "🚛", label: "Land", originLabel: "Departure City", destLabel: "Destination City" },
  air: { emoji: "✈️", label: "Air", originLabel: "Origin Airport", destLabel: "Destination Airport" },
  sea: { emoji: "🚢", label: "Sea", originLabel: "Origin Port", destLabel: "Destination Port" },
};

export default function MapInfoBar({
  origin,
  current,
  destination,
  transportMode = "land",
  currentStopIndex = 0,
  totalStops = 1,
}: {
  origin?: string;
  current?: string;
  destination?: string;
  transportMode?: string;
  currentStopIndex?: number;
  totalStops?: number;
}) {
  const mode = ((transportMode || "land").toLowerCase() as TransportMode);
  const meta = MODE_META[mode] || MODE_META.land;
  const pct = totalStops > 1 ? Math.min(100, Math.max(0, (currentStopIndex / (totalStops - 1)) * 100)) : 0;

  const chips = [
    { color: "#22c55e", label: meta.originLabel, value: origin },
    { color: "#3b82f6", label: "Current Stop", value: current },
    { color: "#ef4444", label: meta.destLabel, value: destination },
  ];

  return (
    <div className="bg-navy-deep text-white p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
          {chips.map((c) => (
            <div key={c.label} className="flex items-center gap-2 px-3 py-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: c.color, boxShadow: `0 0 0 4px ${c.color}40` }}
              />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-white/60">{c.label}</div>
                <div className="text-sm font-bold truncate">{c.value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs font-bold">
          <span className="text-base leading-none">{meta.emoji}</span>
          <span className="uppercase tracking-wider">{meta.label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-3 pb-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60 mb-1">
          <span>{origin || meta.originLabel}</span>
          <span className="text-base leading-none">{meta.emoji}</span>
          <span>{destination || meta.destLabel}</span>
        </div>
        <div className="relative h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] text-white/60 text-center">
          {current || "—"}
        </div>
      </div>
    </div>
  );
}
