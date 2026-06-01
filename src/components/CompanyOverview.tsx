import img1 from "@/assets/overview-customs.jpg";
import img2 from "@/assets/overview-delivery.jpg";
import img3 from "@/assets/overview-tracking.jpg";

const CARDS = [
  {
    img: img1,
    kicker: "ANYWHERE SHIPPING",
    title: "Global Customs & Clearance",
    body: "We handle import/export documentation and customs clearance across 80+ countries, keeping your cargo moving without delays. Tranzex Logistics teams navigate tariff classifications, duty calculations, and regulatory requirements with precision, so your shipments clear borders smoothly every time. Whether you’re importing raw materials, finished goods, or time-sensitive parcels, we provide full end-to-end documentation support and real-time status updates to keep your shipments on schedule.​​​​​​​​​​​​​​​​",
  },
  {
    img: img2,
    kicker: "TIME-CRITICAL DELIVERY",
    title: "Door-to-Door Delivery",
    body: "From warehouse pickup to last-mile delivery, When timing is everything, we deliver, our time-critical delivery service gets your shipment there guaranteed. whether you need same-day express or next-business-day delivery. Every shipment is handled door-to-door with proactive customs clearance, temperature-controlled options for sensitive cargo, and 24/7 live tracking from warehouse pickup to final delivery.​​​​​​​​​​​​​​​​",
  },
  {
    img: img3,
    kicker: "Your cargo’s location and status at your fingertips",
    title: "Real-Time Tracking",
    body: "Gone are the days of waiting on hold for tracking updates. With Tranzex Route Logistics, you get instant, real-time visibility into every stage of your shipment's journey. Our advanced tracking portal displays live location data, estimated delivery windows, customs status, and any transit exceptions — all accessible from any device, anywhere in the world, without ever contacting support.",
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
