import { useEffect, useRef, useState } from "react";

const T = {
  letterDur: 480,
  stagger: 100,
  zexPause: 80,
  underlineDur: 500,
  taglineDur: 500,
  hold: 1400,
  fadeOut: 600,
};

const LETTERS = [
  { ch: "T", color: "#111" },
  { ch: "R", color: "#111" },
  { ch: "A", color: "#111" },
  { ch: "N", color: "#111" },
  { ch: "Z", color: "#E8192C" },
  { ch: "E", color: "#E8192C" },
  { ch: "X", color: "#E8192C" },
];

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [gone, setGone] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ulineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const setLetter = (el: HTMLElement, opacity: number, y: number, dur: number, delay = 0) => {
      el.style.transition =
        dur > 0
          ? `opacity ${dur}ms ease ${delay}ms, transform ${dur}ms cubic-bezier(0.34,1.28,0.64,1) ${delay}ms`
          : "none";
      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${y}px)`;
    };

    (async () => {
      const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];
      const block = blockRef.current!;
      const uline = ulineRef.current!;
      const tag = tagRef.current!;

      // reset
      block.style.transition = "none";
      block.style.opacity = "0";
      letters.forEach((l) => setLetter(l, 0, 20, 0));
      uline.style.transition = "none";
      uline.style.width = "0px";
      tag.style.transition = "none";
      tag.style.opacity = "0";

      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (cancelled) return;

      block.style.opacity = "1";
      letters.forEach((l, i) => {
        const extra = i >= 4 ? T.zexPause : 0;
        setTimeout(() => setLetter(l, 1, 0, T.letterDur), i * T.stagger + extra);
      });

      await sleep(6 * T.stagger + T.zexPause + T.letterDur);
      if (cancelled) return;

      uline.style.transition = `width ${T.underlineDur}ms cubic-bezier(0.4,0,0.2,1)`;
      uline.style.width = "52px";
      await sleep(T.underlineDur - 80);
      if (cancelled) return;

      tag.style.transition = `opacity ${T.taglineDur}ms ease`;
      tag.style.opacity = "1";
      await sleep(T.taglineDur + T.hold);
      if (cancelled) return;

      block.style.transition = `opacity ${T.fadeOut}ms ease`;
      block.style.opacity = "0";
      await sleep(T.fadeOut);
      if (cancelled) return;

      setVisible(false);
      setTimeout(() => setGone(true), 50);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div ref={blockRef} style={{ textAlign: "center", opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", lineHeight: 1 }}>
          {LETTERS.map((l, i) => (
            <span
              key={i}
              ref={(el) => {
                lettersRef.current[i] = el;
              }}
              style={{
                display: "inline-block",
                fontSize: 52,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: l.color,
                willChange: "transform, opacity",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {l.ch}
            </span>
          ))}
        </div>
        <div
          ref={ulineRef}
          style={{
            height: 2.5,
            background: "#E8192C",
            borderRadius: 2,
            margin: "13px auto 0",
            width: 0,
            willChange: "width",
          }}
        />
        <div
          ref={tagRef}
          style={{
            marginTop: 13,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "#bbb",
            opacity: 0,
            willChange: "opacity",
          }}
        >
          Track &nbsp;·&nbsp; Ship &nbsp;·&nbsp; Deliver
        </div>
      </div>
    </div>
  );
}
