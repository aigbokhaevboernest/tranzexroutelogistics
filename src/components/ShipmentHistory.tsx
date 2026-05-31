import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  // Sort newest first by date if parsable
  const sorted = [...history].sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  const showAll = expanded || sorted.length <= 5;
  const visible = showAll ? sorted : sorted.slice(0, 5);

  return (
    <div ref={ref}>
      <ol className="space-y-3 transition-all">
        {visible.map((h, i) => (
          <li
            key={i}
            className={`pl-4 border-l-4 ${i === 0 ? "border-brand-red" : "border-border"} bg-secondary/40 p-3 rounded-r`}
          >
            <div className="text-mono text-xs text-muted-foreground">{h.date}</div>
            {h.status && (
              <div className="mt-1 inline-block bg-navy text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                {h.status}
              </div>
            )}
            {h.location && <div className="mt-1 text-navy font-semibold">{h.location}</div>}
            {h.remarks && <div className="text-sm text-muted-foreground mt-1">{h.remarks}</div>}
            {h.comments && (
              <div className="mt-2 bg-warning/20 border border-warning rounded p-2 text-sm text-navy">
                {h.comments}
              </div>
            )}
          </li>
        ))}
      </ol>
      {sorted.length > 5 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              if (expanded) {
                setExpanded(false);
                setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              } else {
                setExpanded(true);
              }
            }}
            className="inline-flex items-center gap-2 border-2 border-navy text-navy font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:bg-navy hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                View Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View All History <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
