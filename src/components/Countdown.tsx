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
    <div className="flex gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-navy-deep border border-navy text-white px-3 py-2 text-center min-w-[60px] rounded shadow"
        >
          <div className="text-mono font-bold text-xl leading-none">{String(c.v).padStart(2, "0")}</div>
          <div className="text-[10px] text-white/70 mt-1 font-bold tracking-wider">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
