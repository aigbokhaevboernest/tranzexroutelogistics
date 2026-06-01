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
    { label: "DAYS", v: d },
    { label: "HRS", v: h },
    { label: "MIN", v: m },
    { label: "SEC", v: s },
  ];
  return (
    <div className="flex gap-1.5">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-navy-deep border border-navy text-white px-2 py-1 text-center min-w-[42px] rounded"
        >
          <div className="text-mono font-bold text-sm leading-none">{String(c.v).padStart(2, "0")}</div>
          <div className="text-[8px] text-white/70 mt-0.5 font-bold tracking-wider">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
