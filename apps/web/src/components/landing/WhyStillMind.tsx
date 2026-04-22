"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeartHandshake, Brain, Scale3d, ShieldCheck } from "lucide-react";

/* ─── Mesh wireframe background ─── */
function MeshBg() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Base orthogonal grid */}
        <pattern
          id="wgrid"
          width="52"
          height="52"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 52 0 L 0 0 0 52"
            fill="none"
            stroke="rgba(60,100,85,0.10)"
            strokeWidth="0.6"
          />
        </pattern>
        {/* Subtle radial fade mask */}
        <radialGradient id="meshFade" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
        <mask id="meshMask">
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#meshFade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#wgrid)" mask="url(#meshMask)" />
    </svg>
  );
}

/* ─── Principle card data ─── */
const PRINCIPLES = [
  {
    n: "01",
    t: "Student Dignity First",
    d: "The experience is built to reduce uncertainty, not add to it. Clear language, visible progress, and a sense of agency throughout.",
    Icon: HeartHandshake,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    glow: "rgba(139,92,246,0.12)",
  },
  {
    n: "02",
    t: "Human Judgment Stays Central",
    d: "Counselors remain the decision-makers in care delivery. StillMind supports their expertise, it never replaces it.",
    Icon: Brain,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
    glow: "rgba(52,211,153,0.12)",
  },
  {
    n: "03",
    t: "Clear and Fair Prioritization",
    d: "Support is directed with consistency and transparency under real-world capacity limits.",
    Icon: Scale3d,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    glow: "rgba(251,191,36,0.12)",
  },
  {
    n: "04",
    t: "Privacy Built Into the Product",
    d: "Different users see only what they need. Privacy boundaries are enforced by design, not just policy.",
    Icon: ShieldCheck,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    glow: "rgba(96,165,250,0.12)",
  },
];

/* ─── Main component ─── */
export default function WhyStillMind() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yFloat = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [36, -32]
  );

  return (
    <section
      ref={sectionRef}
      id="why"
      className="snap-section min-h-screen flex flex-col items-center justify-center bg-[#ECEAE5] relative overflow-hidden px-6 pt-24 pb-16 lg:pt-32"
    >
      {/* Mesh wireframe */}
      <MeshBg />

      {/* Upper-right ambient bloom */}
      <motion.div
        style={{ y: yFloat }}
        className="pointer-events-none absolute top-[-12%] right-[-6%] w-[48%] aspect-square rounded-full bg-sage/[0.22] blur-[130px]"
      />

      {/* Lower-left counter-bloom */}
      <div className="pointer-events-none absolute bottom-[-8%] left-[-4%] w-[36%] aspect-square rounded-full bg-teal/[0.10] blur-[110px]" />

      <div className="max-w-[1440px] mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8">

        {/* ── Header row ── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.18em] text-teal/60 mb-4 block">
              Why Campuses Choose StillMind
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tight text-teal-dark font-normal">
              Built for trust.
              <br />
              <span className="italic font-normal text-sage">
                Designed for care.
              </span>
            </h2>
          </motion.div>

          <motion.p
            className="font-sans text-base text-teal/80 leading-relaxed lg:pb-1 max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            StillMind brings together student dignity, counselor
            effectiveness, and institutional clarity in one privacy-first
            platform.
          </motion.p>
        </div>

        {/* ── Principle cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.n}
              className="group relative bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl lg:rounded-3xl p-5 lg:p-6 flex flex-col cursor-default overflow-hidden shadow-sm hover:shadow-lg hover:bg-white/70 transition-all duration-500"
              style={{ boxShadow: `0 2px 24px 0 ${p.glow}` }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: 0.08 + i * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={prefersReducedMotion ? undefined : { y: -5 }}
            >
              {/* Card number */}
              <span className="font-serif text-5xl lg:text-6xl font-light text-teal/[0.13] leading-none select-none mb-3 group-hover:text-teal/20 transition-colors duration-700">
                {p.n}
              </span>

              {/* Title */}
              <h3 className="font-sans text-[13px] lg:text-sm font-bold text-teal-dark leading-snug mb-2">
                {p.t}
              </h3>

              {/* Description */}
              <p className="font-sans text-sm text-teal/65 leading-relaxed flex-1">
                {p.d}
              </p>

              {/* Icon tile */}
              <div
                className={`relative mt-5 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${p.iconBg} flex items-center justify-center self-start`}
              >
                {/* Glow halo behind tile */}
                <div
                  className="absolute inset-0 rounded-2xl blur-xl scale-125 opacity-70"
                  style={{ background: p.glow }}
                />
                <p.Icon className={`relative z-10 w-7 h-7 lg:w-8 lg:h-8 ${p.iconColor}`} strokeWidth={1.5} />
              </div>

              {/* Subtle inner corner gradient */}
              <div className="pointer-events-none absolute bottom-0 right-0 w-28 h-28 rounded-tl-[3rem] bg-gradient-to-tl from-white/30 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sparkle accent — bottom right */}
      <motion.div
        className="absolute bottom-7 right-8 text-teal/[0.18]"
        initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12 0l2.09 7.91L22 10l-7.91 2.09L12 20l-2.09-7.91L2 10l7.91-2.09z" />
        </svg>
      </motion.div>
    </section>
  );
}
