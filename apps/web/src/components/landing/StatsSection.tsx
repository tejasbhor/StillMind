"use client";

import { useEffect, useRef } from "react";

const STATS = [
  { value: 1200, suffix: "+", label: "Students supported", description: "Across partner institutions" },
  { value: 94, suffix: "%", label: "Feel heard", description: "Report improved experience" },
  { value: 48, suffix: "h", label: "Wait saved", description: "Median hours reduced" },
  { value: 3, suffix: "×", label: "Faster triage", description: "Vs. manual processes" },
];

function StatItem({ value, suffix, label, description }: (typeof STATS)[number]) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const span = numRef.current;
          if (!span) return;
          let start: number | null = null;
          const duration = 1800;
          const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2.5);
            span.textContent = Math.round(eased * value).toString();
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={wrapRef} className="flex flex-col items-center text-center group">
      <div className="flex items-baseline justify-center">
        <span ref={numRef} className="font-serif text-4xl md:text-5xl text-[#E8F2EE] font-medium">0</span>
        <span className="font-serif text-2xl md:text-3xl text-[#E8F2EE]">{suffix}</span>
      </div>
      <p className="font-sans text-sm md:text-base font-medium text-[#E8F2EE] mt-1">{label}</p>
      <p className="font-sans text-xs text-[#B8D4C0]/60 mt-0.5">{description}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="reveal py-20 md:py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative rounded-[32px] bg-teal px-6 py-12 md:px-12 md:py-16 overflow-hidden shadow-float">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-light rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage-dark rounded-full blur-2xl opacity-20 translate-y-1/2 -translate-x-1/2 animate-float-medium" />
          
          <div className="relative z-10">
            <div className="text-center mb-10 md:mb-14">
              <p className="font-sans text-[10px] font-bold text-sage-light tracking-[0.4em] uppercase mb-4">
                Global Impact
              </p>
              <h3 className="font-serif text-3xl md:text-5xl text-foam leading-tight">
                Data that matters.
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {STATS.map((s) => (
                <StatItem key={s.label} {...s} />
              ))}
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-16 pt-10 border-t border-white/10">
              {[
                "HIPAA Compliant",
                "ISO 27001 Certified",
                "End-to-End Encrypted",
                "GDPR Ready"
              ].map((label) => (
                <div key={label} className="flex items-center gap-2 text-foam/60 group px-4 py-2 rounded-full border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(123,168,154,0.8)]" />
                  <span className="font-sans text-[10px] uppercase font-bold tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}