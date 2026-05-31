import { Ship, Plane, Truck, Package } from "lucide-react";

const SERVICES = [
  { icon: Ship, title: "Ocean Freight", time: "5–7 days", points: ["Door-to-door", "FCL & LCL", "Customs cleared"] },
  { icon: Plane, title: "Air Freight", time: "2–3 days", points: ["Express handling", "Temperature controlled", "Priority lanes"] },
  { icon: Truck, title: "Road Freight", time: "3–4 days", points: ["Nationwide", "Live tracking", "Same-day options"] },
  { icon: Package, title: "Forwarding", time: "Express", points: ["Global network", "Insurance included", "Real-time updates"] },
];

export default function ServicesGrid() {
  return (
    <section className="bg-navy-deep">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
        {SERVICES.map((s) => (
          <div key={s.title} className="bg-[#545865] hover:bg-[#ef4444] transition-colors duration-300 p-8 group">
            <div className="w-16 h-16 border-2 border-brand-red group-hover:border-white flex items-center justify-center mb-6">
              <s.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-display text-white text-2xl font-extrabold uppercase tracking-wide">{s.title}</h3>
            <div className="mt-2 text-brand-orange group-hover:text-white text-mono text-xs tracking-widest uppercase font-bold">{s.time}</div>
            <ul className="mt-5 space-y-2 text-white/80 text-sm">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-brand-orange group-hover:text-white">›</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
