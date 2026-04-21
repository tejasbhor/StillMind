"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Compass, ClipboardList, Building2, Clock, Users, Calendar, Frown, Meh, Smile } from "lucide-react";

/* ─── Feature data ─── */
const FEATURES = [
  {
    icon: Compass,
    title: "For Students",
    desc: "A private, guided path to support with language that feels reassuring instead of clinical. Students see progress, appointments, and next steps without being overwhelmed.",
  },
  {
    icon: ClipboardList,
    title: "For Counselors",
    desc: "Clearer prioritization, better session flow, and less administrative drag. The product supports judgment, it does not replace it.",
  },
  {
    icon: Building2,
    title: "For Institutions",
    desc: "Better visibility into demand, capacity, and response quality, with privacy boundaries built into the experience.",
  },
];

/* ─── Wellbeing trend SVG chart ─── */
function WellbeingChart() {
  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 280 72"
        className="w-full h-[72px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wbGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(123,168,154,0.35)" />
            <stop offset="100%" stopColor="rgba(123,168,154,0)" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <path
          d="M0,62 C20,58 40,52 70,46 C100,40 115,50 140,42 C165,34 185,28 210,22 C230,17 255,20 280,15 L280,72 L0,72 Z"
          fill="url(#wbGrad)"
        />
        {/* Stroke line */}
        <path
          d="M0,62 C20,58 40,52 70,46 C100,40 115,50 140,42 C165,34 185,28 210,22 C230,17 255,20 280,15"
          fill="none"
          stroke="rgba(123,168,154,0.75)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Highlight dot */}
        <circle cx="210" cy="22" r="3.5" fill="#7BA89A" />
        <circle cx="210" cy="22" r="6" fill="rgba(123,168,154,0.2)" />
      </svg>
      {/* Day labels */}
      <div className="flex justify-between mt-1.5 px-0.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span
            key={d}
            className="font-sans text-[9px] font-semibold text-white/25 uppercase tracking-wide"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Sparkle icon ─── */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0l2.09 7.91L22 10l-7.91 2.09L12 20l-2.09-7.91L2 10l7.91-2.09z" />
    </svg>
  );
}

/* ─── Component ─── */
export default function Experience() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const ySoft = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [30, -30]
  );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="snap-section h-screen flex flex-col items-center justify-center bg-[#0B1E1A] text-foam relative overflow-hidden px-6 pt-16"
    >
      {/* Ambient bloom — top right */}
      <motion.div
        style={{ y: ySoft }}
        className="pointer-events-none absolute top-[-8%] right-[-4%] w-[50%] aspect-square rounded-full bg-sage/[0.12] blur-[130px]"
      />
      {/* Subtle bottom-left counter-bloom */}
      <div className="pointer-events-none absolute bottom-0 left-[-6%] w-[35%] aspect-square rounded-full bg-teal/[0.08] blur-[110px]" />
      {/* Radial overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_60%_at_72%_28%,rgba(123,168,154,0.18),transparent_60%)]" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">

          {/* ── LEFT: Copy + Feature list ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tight text-white font-normal mb-5">
              Calm on the surface.
              <br />
              <span className="italic text-sage">
                Powerful where it matters.
              </span>
            </h2>

            <p className="font-sans text-base text-white/75 max-w-sm mb-10 leading-relaxed">
              The experience is designed to feel calm for students, useful for
              counselors, and dependable for institutions.
            </p>

            <div className="space-y-6">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* Icon tile */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.09] flex items-center justify-center mt-0.5">
                    <feat.icon className="w-3.5 h-3.5 text-sage/80" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-black uppercase tracking-[0.1em] text-white mb-1">
                      {feat.title}
                    </h3>
                    <p className="font-sans text-sm text-white/60 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Dashboard mockup ── */}
          <motion.div
            className="relative pb-8"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex gap-3 items-start">

              {/* Main check-in card */}
              <div className="flex-1 rounded-2xl bg-[#102420]/90 border border-white/[0.09] backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
                  <span className="font-sans text-[11px] font-black uppercase tracking-[0.18em] text-sage/70 mb-1.5 block">
                    Daily Check-In
                  </span>
                  <p className="font-serif text-lg text-white/90">
                    How are you feeling today?
                  </p>
                </div>

                {/* Mood picker */}
                <div className="px-5 py-4 border-b border-white/[0.07]">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Low",  Icon: Frown, active: false },
                      { label: "Okay", Icon: Meh,   active: true  },
                      { label: "Good", Icon: Smile,  active: false },
                    ].map((mood) => (
                      <div
                        key={mood.label}
                        className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border cursor-default transition-all duration-300 ${
                          mood.active
                            ? "bg-sage/[0.14] border-sage/35"
                            : "bg-white/[0.025] border-white/[0.07]"
                        }`}
                      >
                        <mood.Icon
                          className={`w-5 h-5 ${
                            mood.active ? "text-sage" : "text-white/35"
                          }`}
                          strokeWidth={1.5}
                        />
                        <span
                          className={`font-sans text-[9px] font-black uppercase tracking-widest ${
                            mood.active ? "text-sage" : "text-white/40"
                          }`}
                        >
                          {mood.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wellbeing trend */}
                <div className="px-5 pt-4 pb-5">
                  <span className="font-sans text-[9px] font-black uppercase tracking-[0.28em] text-white/30 mb-3 block">
                    Wellbeing Trend
                  </span>
                  <WellbeingChart />
                </div>
              </div>

              {/* Side stat cards — stacked */}
              <div className="flex flex-col gap-3 w-[148px] shrink-0 mt-2">

                {/* Wait time */}
                <motion.div
                  className="rounded-xl bg-[#0F2421]/90 border border-white/[0.09] backdrop-blur-xl p-3.5 shadow-xl"
                  initial={{ opacity: 0, y: -12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3 h-3 text-sage/50 shrink-0" />
                    <span className="font-sans text-[8.5px] text-white/38 uppercase tracking-wide leading-tight">
                      Wait time reduced by
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans text-[1.1rem] font-black text-white leading-none">
                      48 hrs
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sage text-[#0B1E1A]">
                      48 HRS
                    </span>
                  </div>
                </motion.div>

                {/* Client match */}
                <motion.div
                  className="rounded-xl bg-[#0F2421]/90 border border-white/[0.09] backdrop-blur-xl p-3.5 shadow-xl"
                  initial={{ opacity: 0, y: -8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="w-3 h-3 text-sage/50 shrink-0" />
                    <span className="font-sans text-[8.5px] text-white/38 uppercase tracking-wide">
                      Client Match:
                    </span>
                  </div>
                  <span className="font-sans text-base font-black text-white">
                    High
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Bottom floating pill — Next Session */}
            <motion.div
              className="absolute bottom-0 left-6 rounded-xl bg-[#0F2421]/95 border border-white/[0.1] backdrop-blur-xl px-4 py-2.5 shadow-xl flex items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-sage/70" />
              </div>
              <div>
                <span className="font-sans text-[8.5px] font-black uppercase tracking-[0.22em] text-white/35 block">
                  Next Session
                </span>
                <span className="font-sans text-sm font-bold text-white">
                  Tomorrow, 2:00 PM
                </span>
              </div>
            </motion.div>

            {/* Sparkle accent — bottom right */}
            <motion.div
              className="absolute -bottom-1 right-0 text-white/15"
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sparkle className="w-7 h-7" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
