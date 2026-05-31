import { Link } from "react-router-dom";
import containers from "@/assets/containers.jpg";

export default function InternationalBanner() {
  return (
    <section className="relative py-28 overflow-hidden">
      <img src={containers} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[oklch(0.12_0.035_265/0.8)]" />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <div className="text-brand-orange text-mono text-xs font-bold tracking-widest mb-4">GLOBAL REACH</div>
        <h2 className="text-display text-5xl md:text-7xl font-black uppercase text-brand-red leading-none">
          INTERNATIONAL
          <br />
          CARGO
        </h2>
        <Link
          to="/tracking"
          className="mt-8 inline-flex items-center justify-center bg-brand-red text-white text-display tracking-wider font-bold px-8 py-4 rounded-md hover:opacity-90"
        >
          START TRACKING →
        </Link>
      </div>
    </section>
  );
}
