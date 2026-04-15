"use client";

import { useEffect, useRef } from "react";

const STATS = [
  { value: 1200, suffix: "+", label: "Students supported" },
  { value: 94,   suffix: "%", label: "Report feeling heard" },
  { value: 48,   suffix: "h", label: "Median wait time saved" },
  { value: 3,    suffix: "×", label: "Faster triage than manual" },
];

function useCountUp(targetRef: React.RefObject<HTMLSpanElement | null>, end: number, duration = 1600) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.round(eased * end).toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [targetRef, end, duration]);
}

function StatItem({ value, suffix, label }: (typeof STATS)[number]) {
  const numRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // trigger count-up by updating the ref element
          const span = numRef.current;
          if (!span) return;
          let start: number | null = null;
          const duration = 1600;
          const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            span.textContent = Math.round(eased * value).toString();
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-1 text-center">
      <p className="font-serif text-5xl text-[#3D5A54] leading-none">
        <span ref={numRef}>0</span>
        <span>{suffix}</span>
      </p>
      <p className="font-sans text-sm font-light text-[#7F96B8] max-w-[8rem]">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="reveal py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-[#3D5A54] px-8 py-14">
          <p className="font-sans text-center text-sm font-light text-[#B8D4C0] tracking-widest uppercase mb-12">
            By the numbers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
