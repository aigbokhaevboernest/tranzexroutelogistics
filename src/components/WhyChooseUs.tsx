import { Shield, Clock, Globe2, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Shield, title: "TRUSTED NETWORK", body: "Vetted carriers worldwide." },
  { icon: Clock, title: "ON-TIME DELIVERY", body: "98% on-schedule rate." },
  { icon: Globe2, title: "GLOBAL COVERAGE", body: "80+ countries served." },
  { icon: Headphones, title: "24/7 SUPPORT", body: "Always-on customer care." },
];

export default function WhyChooseUs() {
  return (
    <section id="support" className="bg-navy py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-12">
          <span className="block w-1.5 h-8 bg-brand-red" />
          <h2 className="text-display text-4xl md:text-5xl font-extrabold uppercase text-white">
            Why <span className="text-brand-red">Choose Us</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((it) => (
            <div key={it.title} className="bg-navy-deep p-8 rounded-md border border-white/10 hover:border-brand-red transition-colors">
              <div className="w-14 h-14 rounded-md bg-brand-red flex items-center justify-center mb-5">
                <it.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-display text-white text-xl font-extrabold uppercase">{it.title}</h3>
              <p className="mt-2 text-white/70 text-sm">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
