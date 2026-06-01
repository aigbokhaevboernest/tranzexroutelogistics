import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-truck.jpg";
import hero2 from "@/assets/hero-worker.jpg";
import hero3 from "@/assets/hero-manager.jpg";

const SLIDES = [
  {
    img: hero1,
    line1: "FAST",
    line2: "SERVICES",
    sub: "Experience fast, efficient, and dependable shipping services tailored to meet your needs. We prioritize speed without compromising the safety of your shipments.",
  },
  {
    img: hero2,
    line1: "DELIVERY",
    line2: "EXPRESS",
    sub: "Take advantage of our express delivery service for urgent shipments. With rapid transit times and real-time tracking, your packages reach their destination quickly and securely.",
  },
  {
    img: hero3,
    line1: "START",
    line2: "SHIPPING",
    sub: "Begin your shipping journey with ease. We provide secure, reliable, and hassle-free delivery solutions to help you send packages locally and internationally with confidence.",
  },
];

function useTypewriter(words: string, speed = 120, pause = 3000) {
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i <= words.length) {
        setText(words.slice(0, i));
        i++;
        timer = setTimeout(tick, speed);
      } else {
        timer = setTimeout(() => {
          i = 0;
          tick();
        }, pause);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [words, speed, pause]);
  return text;
}

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [query, setQuery] = useState("");
  const placeholder = useTypewriter("Enter Your Tracking Number");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hover) return;
    intervalRef.current = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hover]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = "/tracking?n=" + encodeURIComponent(query.trim());
  };

  return (
    <section
      id="hero"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-navy-deep"
    >
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-2000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== idx}
        >
          <img
            src={s.img}
            alt=""
            className={`w-full h-full object-cover ${i === idx ? "animate-kenburns" : ""}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 hero-grain" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pt-16">
        <span className="inline-block px-4 py-1.5 bg-brand-red/90 text-white text-xs font-bold tracking-widest rounded-full mb-6 opacity-0 animate-slide-up-fade" style={{ animationDelay: "200ms" }}>
          ● Logistics Cargo Service ●
        </span>
        <h1 key={idx} className="text-display font-black leading-[0.95] text-white opacity-0 animate-slide-up-fade" style={{ fontSize: "clamp(3rem,12vw,7rem)", animationDelay: "400ms" }}>
          {SLIDES[idx].line1}
          <br />
          <span className="text-brand-red">{SLIDES[idx].line2}</span>
        </h1>
        <p key={`sub-${idx}`} className="mt-6 max-w-2xl text-white/85 text-base md:text-lg opacity-0 animate-slide-up-fade" style={{ animationDelay: "550ms" }}>
          {SLIDES[idx].sub}
        </p>

        <form onSubmit={submit} className="mt-8 w-full max-w-2xl opacity-0 animate-slide-up-fade" style={{ animationDelay: "700ms" }}>
          <div className="flex items-stretch rounded-md overflow-hidden bg-white shadow-2xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-5 py-4 text-navy text-mono text-sm md:text-base outline-none"
            />
            <button type="submit" className="bg-brand-red text-white font-bold px-6 md:px-10 text-display tracking-wider">
              TRACK
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="mailto:support@tranzexroute.com" className="text-white/90 hover:text-brand-orange underline-offset-4 hover:underline">Problem Tracking?</a>
            <a href="mailto:support@tranzexroute.com" className="text-white/90 hover:text-brand-orange underline-offset-4 hover:underline">Need Help?</a>
          </div>
        </form>
      </div>

      <button onClick={() => setIdx((idx - 1 + SLIDES.length) % SLIDES.length)} aria-label="Previous" className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-brand-red text-white z-20">
        <ChevronLeft />
      </button>
      <button onClick={() => setIdx((idx + 1) % SLIDES.length)} aria-label="Next" className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-brand-red text-white z-20">
        <ChevronRight />
      </button>

      <div className="absolute bottom-8 inset-x-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-10 bg-brand-red" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
