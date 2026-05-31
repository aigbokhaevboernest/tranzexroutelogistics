import img1 from "@/assets/overview-customs.jpg";
import img2 from "@/assets/overview-delivery.jpg";
import img3 from "@/assets/overview-tracking.jpg";

const CARDS = [
  {
    img: img1,
    kicker: "ANYWHERE SHIPPING",
    title: "Global Customs & Clearance",
    body: "We handle import/export documents and customs clearance across 80+ countries so your cargo keeps moving.",
  },
  {
    img: img2,
    kicker: "INSIGHTS & INSPIRATION",
    title: "Door-to-Door Delivery",
    body: "From warehouse pickup to last-mile delivery, our trained couriers handle every shipment with care.",
  },
  {
    img: img3,
    kicker: "YOUR FREIGHT DEADLINES",
    title: "Real-Time Tracking",
    body: "Live shipment status, instant alerts, and an always-up-to-date map keep you in control end to end.",
  },
];

export default function CompanyOverview() {
  const scroll = () => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-12">
          <span className="block w-1.5 h-8 bg-brand-red" />
          <h2 className="text-display text-4xl md:text-5xl font-extrabold uppercase text-navy">
            Company <span className="text-brand-red">Overview</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {CARDS.map((c) => (
            <article key={c.title} className="bg-white border border-border rounded-md overflow-hidden hover:shadow-2xl transition-shadow">
              <img src={c.img} alt={c.title} loading="lazy" className="w-full h-56 object-cover" />
              <div className="p-6">
                <div className="text-brand-orange text-mono text-xs font-bold tracking-widest">{c.kicker}</div>
                <h3 className="mt-2 text-display text-2xl font-extrabold uppercase text-navy">{c.title}</h3>
                <p className="mt-3 text-muted-foreground text-sm">{c.body}</p>
                <button onClick={scroll} className="mt-4 text-brand-red font-bold text-sm hover:underline">
                  Get Started →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
