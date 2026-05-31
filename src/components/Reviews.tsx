import { Star, Quote } from "lucide-react";

export default function Reviews() {
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
        <div className="relative mt-12 bg-secondary p-10 rounded-md">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-brand-red rounded-full flex items-center justify-center">
            <Quote className="w-6 h-6 text-white" />
          </div>
          <p className="text-navy text-lg italic leading-relaxed">
            "I used Tranzex Route Logistics several times and have always found them to be reliable, courteous, and affordable to work with for Google items and airways"
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-extrabold">JH</div>
            <div className="text-left">
              <div className="font-bold text-navy">Jonah Hex</div>
              <div className="text-xs text-muted-foreground">Verified Customer</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
