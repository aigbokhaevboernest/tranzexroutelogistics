import { useEffect, useState } from "react";

export default function Countdown({ target }: { target?: string | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cells = [
    { label: "D", v: d },
    { label: "H", v: h },
    { label: "M", v: m },
    { label: "S", v: s },
  ];
  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.label} className="bg-white border border-border px-3 py-2 text-center min-w-[52px] rounded">
          <div className="text-mono text-navy font-bold text-lg leading-none">{String(c.v).padStart(2, "0")}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
