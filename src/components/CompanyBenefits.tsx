import { Check } from "lucide-react";

const BENEFITS = [
  "Live tracking and instant status notifications",
  "Door-to-door pickup and delivery across the globe",
  "Insurance-backed shipments with full claim support",
  "Dedicated account managers and 24/7 customer care",
];

export default function CompanyBenefits() {
  return (
    <section className="bg-secondary py-24">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-brand-red text-mono text-xs font-bold tracking-widest">COMPANY BENEFITS</div>
          <h2 className="mt-3 text-display text-4xl md:text-5xl font-extrabold uppercase text-navy leading-tight">
            TOP <span className="text-brand-red">BENEFITS</span>
          </h2>
        </div>
        <div>
          <p className="text-muted-foreground">
            Tranzex Route Logistics combines reliable freight forwarding with modern tracking technology so your shipments arrive on time, every time.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="text-navy font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
