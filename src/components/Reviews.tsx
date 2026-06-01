import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const REVIEWS = [
  {
    initials: "JH",
    name: "Jonah Hex",
    role: "Verified Customer",
    text: "I used Tranzex Route Logistics several times and have always found them to be reliable, courteous, and affordable to work with for Google items and airways",
  },
  {
    initials: "MA",
    name: "Maria Alvarez",
    role: "Verified Customer",
    text: "My shipment from Manila to Madrid arrived two days early. The live tracking map kept me calm the entire time — I knew exactly where my package was.",
  },
  {
    initials: "DK",
    name: "Daniel Kim",
    role: "Business Client",
    text: "We've moved over 40 pallets through Tranzex this quarter. Customs clearance is fast, support answers within minutes, and pricing stays consistent. Highly recommended.",
  },
  {
    initials: "AO",
    name: "Amara Okonkwo",
    role: "Verified Customer",
    text: "First international shipment and they walked me through every step. The package was triple-wrapped and arrived in pristine condition. I'll never use anyone else.",
  },
  {
    initials: "LP",
    name: "Liam Patterson",
    role: "E-commerce Seller",
    text: "Their door-to-door delivery service has cut my fulfillment time in half. The dashboard, the tracking page, the support — everything just works.",
  },
  {
    initials: "SR",
    name: "Sofia Rossi",
    role: "Verified Customer",
    text: "Sent fragile glassware overseas and was terrified. Not a single chip. The handling team clearly cares. Worth every cent.",
  },
];

export default function Reviews() {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef<number | null>(null);
  const hover = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!hover.current) setIdx((i) => (i + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const go = (n: number) => setIdx((n + REVIEWS.length) % REVIEWS.length);

  return (
    <section className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-brand-orange text-mono text-xs font-bold tracking-widest">SHIPPING CARGO</div>
        <h2 className="mt-2 text-display text-4xl md:text-5xl font-extrabold uppercase text-navy">
          OUR TOP <span className="text-brand-red">REVIEWS</span>
        </h2>
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-brand-orange text-brand-orange" />
          ))}
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => (hover.current = true)}
          onMouseLeave={() => (hover.current = false)}
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          <div className="overflow-hidden rounded-md">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {REVIEWS.map((r, i) => (
                <div key={i} className="w-full shrink-0 px-1">
                  <div className="relative bg-secondary p-10 rounded-md">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-brand-red rounded-full flex items-center justify-center">
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-navy text-lg italic leading-relaxed">"{r.text}"</p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-extrabold">
                        {r.initials}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-navy">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            aria-label="Previous review"
            onClick={() => go(idx - 1)}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white border border-border shadow hover:bg-brand-red hover:text-white text-navy"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Next review"
            onClick={() => go(idx + 1)}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white border border-border shadow hover:bg-brand-red hover:text-white text-navy"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="mt-6 flex justify-center gap-1.5">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to review ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-brand-red" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
