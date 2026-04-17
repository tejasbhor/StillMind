"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 1200, suffix: "+", label: "Students supported", sub: "Across partner institutions" },
  { value: 94, suffix: "%", label: "Feel heard", sub: "Report improved experience" },
  { value: 48, suffix: "h", label: "Wait time saved", sub: "Median hours reduced" },
  { value: 3, suffix: "×", label: "Faster triage", sub: "Vs. manual processes" },
];

function StatItem({ value, suffix, label, sub, index }: (typeof STATS)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 1500;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-2 lg:gap-3 group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Number */}
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-3xl lg:text-4xl xl:text-5xl text-white tabular-nums leading-none">
          {display}
        </span>
        <span className="font-serif text-xl lg:text-2xl xl:text-3xl text-sage-light leading-none">{suffix}</span>
      </div>

      {/* Label */}
      <div className="flex flex-col gap-0.5">
        <p className="font-sans text-xs lg:text-sm font-semibold text-foam/90">{label}</p>
        <p className="font-sans text-[10px] lg:text-xs text-foam/40">{sub}</p>
      </div>

      {/* Animated underline on hover */}
      <motion.div
        className="h-px bg-sage/30 w-0 group-hover:w-full transition-all duration-300 rounded-full"
      />
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section className="h-screen flex flex-col items-center justify-center px-6 pt-20 bg-teal relative overflow-hidden">
      {/* Single ambient accent — not competing with content */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-sage/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">

        {/* Header row */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sage mb-2 lg:mb-3 block">
              Global Impact
            </span>
            <h3 className="font-serif text-3xl lg:text-4xl xl:text-5xl text-white leading-tight">
              Data that matters.
            </h3>
          </div>
          <p className="font-sans text-xs lg:text-sm text-foam/50 max-w-xs leading-relaxed md:text-right">
            Real outcomes from real students across our institutional network.
          </p>
        </motion.div>

        {/* Stats grid - Responsive: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 xl:gap-16 border-t border-white/10 pt-10 lg:pt-12">
          {STATS.map((s, i) => (
            <StatItem key={s.label} {...s} index={i} />
          ))}
        </div>

        {/* Compliance row */}
        <motion.div
          className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/[0.07]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >

          {["HIPAA Compliant", "ISO 27001 Certified", "End-to-End Encrypted", "GDPR Ready"].map((label) => (
            <div key={label} className="flex items-center gap-2 group cursor-default">
              <div className="w-1 h-1 rounded-full bg-sage/60 group-hover:bg-sage transition-colors" />
              <span className="font-sans text-[9px] uppercase font-black tracking-widest text-foam/35 group-hover:text-foam/60 transition-colors">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

