export type TransportMode = "land" | "air" | "sea";

// Same color set as LeafletMap.tsx — keep both in sync if you ever change
// a mode's color, or better yet, import MODE_COLORS from LeafletMap.tsx
// directly if your bundler/project structure allows a shared constants file.
const MODE_COLORS: Record<TransportMode, string> = {
  land: "#f97316",
  air: "#3b82f6",
  sea: "#92400e",
};
const HOLD_COLOR = "#f59e0b";

/** Clean icons facing RIGHT (toward destination) — no emoji */
function ModeIcon({ mode }: { mode: TransportMode }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-white/90",
  };

  if (mode === "air") {
    return (
      <svg {...common}>
        <path d="M2 16l7-3 3-8 2 1-2 7 7-2 2 2-7 3v3l3 2v2l-4-1-4 1v-2l3-2v-3l-7 2-2-2z" />
      </svg>
    );
  }

  if (mode === "sea") {
    return (
      <svg {...common}>
        <path d="M3 16l1.5-6h15L21 16" />
        <path d="M6 10V5h6l3 5" />
        <path d="M2 19c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="1" y="8" width="12" height="8" rx="1" />
      <path d="M13 11h4l4 3v2h-8z" />
      <circle cx="5.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export default function MapInfoBar({
  origin,
  current,
  destination,
  transportMode = "land",
  status,
  currentStopIndex = 0,
  totalStops = 1,
}: {
  origin?: string;
  current?: string;
  destination?: string;
  transportMode?: string;
  status?: string;
  currentStopIndex?: number;
  totalStops?: number;
}) {
  const mode = ((transportMode || "land").toLowerCase() as TransportMode);
  const isOnHold = (status || "").toLowerCase().includes("hold");
  const currentColor = isOnHold ? HOLD_COLOR : MODE_COLORS[mode];

  // Progress bar fix: a single-stop journey (e.g. only "Delivered" is
  // visible) should read as complete rather than stuck at 0%. For
  // multi-stop journeys, clamp the index into range before dividing so a
  // stale/out-of-range index can't push the bar past 100% or negative.
  const pct = (() => {
    if (totalStops <= 1) return currentStopIndex >= 0 ? 100 : 0;
    const clampedIndex = Math.min(Math.max(currentStopIndex, 0), totalStops - 1);
    return Math.min(100, Math.max(0, (clampedIndex / (totalStops - 1)) * 100));
  })();

  const stops = [
    { color: "#22c55e", role: "Origin", name: origin },
    { color: currentColor, role: "Current Stop", name: current },
    { color: "#ef4444", role: "Destination", name: destination },
  ];

  return (
    <div className="bg-navy-deep text-white p-3 space-y-3">
      {/* Top row: Origin ····· Current ····· Destination — always one line */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto">
        {stops.map((s, i) => (
          <div key={s.role} className="flex items-center min-w-0 flex-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color, boxShadow: `0 0 0 3px ${s.color}40` }}
                />
                <span className="text-xs sm:text-sm font-bold truncate">{s.name || "—"}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 pl-4">
                {s.role}
              </div>
            </div>

            {i < stops.length - 1 && (
              <div
                className="flex-1 mx-1.5 mt-[5px] border-t border-dashed border-white/30 min-w-[10px]"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar row — clean icon facing right, no emoji */}
      <div className="px-0.5 pb-0.5">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-widest text-white/60 mb-1 gap-2">
          <span className="truncate">{origin || "Origin"}</span>
          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
            <ModeIcon mode={mode} />
          </span>
          <span className="truncate text-right">{destination || "Destination"}</span>
        </div>
        <div className="relative h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${currentColor}, #ef4444)` }}
          />
        </div>
        <div className="mt-1 text-[10px] text-white/60 text-center truncate">
          {current || "—"}
        </div>
      </div>
    </div>
  );
}
