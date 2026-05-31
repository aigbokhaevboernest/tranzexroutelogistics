export default function MapInfoBar({
  origin,
  current,
  destination,
}: {
  origin?: string;
  current?: string;
  destination?: string;
}) {
  const chips = [
    { color: "#22c55e", label: "Origin", value: origin },
    { color: "#3b82f6", label: "Current Stop", value: current },
    { color: "#ef4444", label: "Destination", value: destination },
  ];
  return (
    <div className="bg-[#0f172a] text-white grid grid-cols-1 md:grid-cols-3 gap-2 p-3 rounded-t-md">
      {chips.map((c) => (
        <div key={c.label} className="flex items-center gap-2 px-3 py-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: c.color, boxShadow: `0 0 0 4px ${c.color}40` }} />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">{c.label}</div>
            <div className="text-sm font-bold">{c.value || "—"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
