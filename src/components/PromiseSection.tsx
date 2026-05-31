export default function PromiseSection() {
  return (
    <section className="relative bg-brand-red py-24 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center">
          <div className="relative w-72 h-72 rounded-full bg-brand-red border-2 border-white/30 flex items-center justify-center">
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-white/50 animate-spin-slow" />
            <div className="text-center text-white">
              <div className="text-display text-3xl font-extrabold">Tranzex</div>
              <div className="text-display text-2xl font-bold">Promise</div>
              <div className="mt-2 text-brand-orange text-lg tracking-widest">★ ★ ★</div>
            </div>
          </div>
        </div>
        <div className="text-white">
          <div className="text-white/80 text-mono text-xs font-bold tracking-widest">OUR CHALLENGES</div>
          <h2 className="mt-3 text-display text-4xl md:text-6xl font-black uppercase leading-tight">
            NEVER BREAK
            <br />
            OUR PROMISE
          </h2>
          <a href="#about" className="mt-6 inline-block text-white border-b-2 border-white pb-1 font-bold tracking-wider">
            SHORT STORY →
          </a>
        </div>
      </div>
    </section>
  );
}
