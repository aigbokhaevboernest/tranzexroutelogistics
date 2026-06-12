import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getStepColor } from "./Stepper";

type HistoryItem = {
  date?: string;
  status?: string;
  location?: string;
  remarks?: string;
  comments?: string;
};

export default function ShipmentHistory({ history }: { history?: HistoryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  if (!Array.isArray(history) || history.length === 0) {
    return <div className="text-muted-foreground text-sm">No history yet.</div>;
  }

  const parseDate = (d?: string) => {
    if (!d) return 0;
    const t = new Date(d).getTime();
    if (!isNaN(t)) return t;
    // fallback: try Date.parse with normalized separators
    const t2 = Date.parse(String(d).replace(/-/g, "/"));
    return isNaN(t2) ? 0 : t2;
  };
  const fmtDate = (d?: string) => {
    if (!d) return "";
    const t = parseDate(d);
    if (!t) return d;
    return new Date(t).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };
  const sorted = [...history].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const LIMIT = 3;
  const showAll = expanded || sorted.length <= LIMIT;
  const visible = showAll ? sorted : sorted.slice(0, LIMIT);

  return (
    <div ref={ref}>
      <ol className="relative">
        {visible.map((h, i) => {
          const isCurrent = i === 0;
          const color = getStepColor(h.status || "");
          return (
            <li key={i} className="relative pl-7 pb-4 last:pb-0">
              {/* vertical line */}
              {i < visible.length - 1 && (
                <span
                  className="absolute left-[10px] top-3 bottom-0 w-0.5"
                  style={{ background: isCurrent ? "var(--brand-red)" : "oklch(0.88 0 0)" }}
                />
              )}
              {/* dot */}
              <span
                className="absolute left-1 top-1.5 w-4 h-4 rounded-full border-2 border-white"
                style={{
                  background: isCurrent ? "var(--brand-red)" : "oklch(0.78 0 0)",
                  boxShadow: isCurrent
                    ? "0 0 0 2px var(--brand-red), 0 0 0 4px white"
                    : "0 0 0 2px oklch(0.85 0 0)",
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-mono text-[11px] text-muted-foreground">{h.date}</span>
                {h.status && (
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: color }}
                  >
                    {h.status}
                  </span>
                )}
                {h.location && (
                  <span className="text-navy text-sm font-semibold">{h.location}</span>
                )}
              </div>
              {(h.remarks || h.comments) && (
                <div
                  className="mt-1.5 rounded p-2 text-sm text-navy/80 border"
                  style={{
                    background: "oklch(0.96 0.005 260 / 0.5)",
                    borderColor: "oklch(0.91 0.01 260)",
                  }}
                >
                  {h.remarks || h.comments}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {sorted.length > LIMIT && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => {
              if (expanded) {
                setExpanded(false);
                setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              } else {
                setExpanded(true);
              }
            }}
            className="inline-flex items-center gap-1.5 border border-navy text-navy font-bold uppercase tracking-wider text-[10px] px-3 py-1.5 rounded hover:bg-navy hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                View Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                View All History <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
