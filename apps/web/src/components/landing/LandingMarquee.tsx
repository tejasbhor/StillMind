"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeartPulse, ShieldCheck, Sparkles, TimerReset, Users } from "lucide-react";

const STRIP_ITEMS = [
  { label: "Privacy-first architecture", icon: ShieldCheck },
  { label: "Human-led mental health support", icon: HeartPulse },
  { label: "Calm, guided user journeys", icon: Sparkles },
  { label: "Rapid response workflows", icon: TimerReset },
  { label: "Built for campus scale", icon: Users },
];

export default function LandingMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const items = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <section className="relative -mt-2 z-20 px-6 pb-2">
      <div className="mx-auto max-w-[1440px] rounded-2xl border border-teal/10 bg-white/70 backdrop-blur-xl overflow-hidden shadow-soft">
        <div className="mask-fade-x">
          <motion.div
            className="marquee-track py-3"
            animate={prefersReducedMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : { duration: 28, ease: "linear", repeat: Infinity }
            }
          >
            {items.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="mx-6 inline-flex items-center gap-2.5 whitespace-nowrap"
              >
                <item.icon className="h-3.5 w-3.5 text-sage" />
                <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-teal/80">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

