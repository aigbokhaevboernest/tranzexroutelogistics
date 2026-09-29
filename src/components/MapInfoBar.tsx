export type TransportMode = "land" | "air" | "sea";

const MODE_COLORS: Record<TransportMode, string> = {
  land: "#7c3aed",
  air: "#3b82f6",
  sea: "#92400e",
};
const HOLD_COLOR = "#f59e0b";

function ModeIcon({ mode }: { mode: TransportMode }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (mode === "air") {
  return (
    <svg {...common} viewBox="0 0 16 16" strokeWidth={0.9}>
      <path d="M8 0c-.787 0-1.292.592-1.572 1.151A4.35 4.35 0 0 0 6 3v3.691l-2 1V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.191l-1.17.585A1.5 1.5 0 0 0 0 10.618V12a.5.5 0 0 0 .582.493l1.631-.272.313.937a.5.5 0 0 0 .948 0l.405-1.214 2.21-.369.375 2.253-1.318 1.318A.5.5 0 0 0 5.5 16h5a.5.5 0 0 0 .354-.854l-1.318-1.318.375-2.253 2.21.369.405 1.214a.5.5 0 0 0 .948 0l.313-.937 1.63.272A.5.5 0 0 0 16 12v-1.382a1.5 1.5 0 0 0-.83-1.342L14 8.691V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v.191l-2-1V3c0-.568-.14-1.271-.428-1.849C9.292.591 8.787 0 8 0" />
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
  /** Exact 0-100 progress percentage, computed by the caller from real
   * distance (land) or route-position (air/sea). When provided this is
   * used directly instead of the older step-index approximation. */
  progressPercent,
  currentStopIndex = 0,
  totalStops = 1,
}: {
  origin?: string;
  current?: string;
  destination?: string;
  transportMode?: string;
  status?: string;
  progressPercent?: number;
  currentStopIndex?: number;
  totalStops?: number;
}) {
  const mode = ((transportMode || "land").toLowerCase() as TransportMode);
  const isOnHold = (status || "").toLowerCase().includes("hold");
  const currentColor = isOnHold ? HOLD_COLOR : MODE_COLORS[mode];

  const pct = (() => {
    if (typeof progressPercent === "number" && Number.isFinite(progressPercent)) {
      return Math.min(100, Math.max(0, progressPercent));
    }
    // Fallback for cases with no distance/route data available (e.g. land
    // shipment with no current-stop coordinates yet).
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

      {/* Progress bar — icon + current-stop label slide along the bar at
          the real percentage instead of sitting fixed in the center */}
      <div className="relative pt-1 pb-9">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
          <span className="truncate max-w-[38%]">{origin || "Origin"}</span>
          <span className="truncate max-w-[38%] text-right">{destination || "Destination"}</span>
        </div>

        <div className="relative h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, ${currentColor}, #ef4444)` }}
          />
        </div>

        <div
          className="absolute top-[26px] flex flex-col items-center transition-all duration-500"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        >
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/20 shrink-0"
            style={{ background: currentColor }}
          >
            <ModeIcon mode={mode} />
          </span>
          <span className="mt-1 text-[9px] font-semibold text-white/80 whitespace-nowrap max-w-[110px] truncate text-center">
            {current || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
