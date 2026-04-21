"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Lock, Users, Headphones, Eye,
  ShieldCheck, BarChart3, Clock, Trophy,
  Calendar, ArrowRight,
} from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import Logo from "@/components/brand/Logo";

/* ─── Right-column feature rows ─── */
const FEATURES = [
  { Icon: Lock,       title: "Privacy-first by design",        desc: "Student data stays protected with enterprise-grade security." },
  { Icon: Users,      title: "Built for high-volume campuses",  desc: "Scales with your institution—no matter the size." },
  { Icon: Headphones, title: "Human-centered support",          desc: "Real people, real care, when students need it most." },
  { Icon: Eye,        title: "Clear oversight for teams",       desc: "Actionable insights and reporting that drive meaningful change." },
];

/* ─── Bottom trust stats ─── */
const TRUST_STATS = [
  { Icon: ShieldCheck, title: "Trusted by 100+",    sub: "Institutions worldwide" },
  { Icon: BarChart3,   title: "Measurable impact",  sub: "Better outcomes, proven" },
  { Icon: Clock,       title: "Quick to implement", sub: "Go live in weeks, not months" },
  { Icon: Trophy,      title: "Proven results",     sub: "Backed by real student outcomes" },
];

export default function CTA() {
  return (
    <section
      id="cta"
      className="snap-section relative flex h-screen flex-col overflow-hidden bg-[#031a1f] px-6 pt-24 pb-6 lg:pt-28"
    >
      {/* Ambient blooms */}
      <div className="pointer-events-none absolute top-[-12%] right-[-6%] w-[42%] aspect-square rounded-full bg-sage/[0.09] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-8%] left-[-4%] w-[32%] aspect-square rounded-full bg-teal/[0.07] blur-[110px]" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-4 flex-1 justify-center">

        {/* ── Main card ── */}
        <motion.div
          className="relative rounded-[1.5rem] bg-[#06242a]/90 border border-white/[0.14] overflow-hidden shadow-[0_30px_90px_rgba(4,27,31,0.45)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Card inner radial accents */}
          <div className="pointer-events-none absolute top-0 right-0 w-[55%] h-[70%] bg-[radial-gradient(ellipse_at_top_right,rgba(123,168,154,0.10),transparent_55%)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-[40%] h-[50%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(123,168,154,0.06),transparent_55%)]" />

          {/* 2-col grid */}
          <div className="grid lg:grid-cols-2 relative z-10">

            {/* LEFT: Brand + Copy + Buttons */}
            <div className="flex flex-col gap-5 p-10 lg:p-12 justify-center border-r border-white/[0.07]">

              {/* Logo lockup */}
              <Logo variant="horizontal" iconSize="sm" suppressLink className="opacity-95" />

              {/* Heading — matches Hero text-[3.5rem] */}
              <div>
                <h2 className="font-serif text-4xl lg:text-[3.45rem] leading-[1.03] tracking-tight text-white font-normal">
                  Build a better<br />
                  <span className="italic text-sage">first step.</span>
                </h2>
                <div className="w-14 h-[2px] bg-sage/40 rounded-full mt-5" />
              </div>

              {/* Description — matches Hero text-base */}
              <p className="font-sans text-[1.05rem] text-white/78 max-w-[31rem] leading-relaxed">
                StillMind helps campuses deliver earlier support, calmer experiences, and clearer institutional confidence.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 border border-white/30 bg-white text-[#0b2830] hover:bg-white/90 font-sans font-black text-[11px] uppercase tracking-[0.18em] px-7 py-3.5 rounded-full transition-all duration-300"
                  >
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Book a Demo
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </MagneticButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 border border-white/25 text-white/90 hover:text-white hover:border-white/40 font-sans font-black text-[11px] uppercase tracking-[0.18em] px-7 py-3.5 rounded-full transition-all duration-300"
                >
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Talk to Our Team
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-sage/50" strokeWidth={1.5} />
                <span className="font-sans text-[0.95rem] text-white/72">
                  Secure. Private. Built for higher education.
                </span>
              </div>
            </div>

            {/* RIGHT: Feature list — fills card height evenly */}
            <div className="flex flex-col justify-center divide-y divide-white/[0.08] p-10 lg:p-12">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-11 h-11 rounded-full bg-[#1b544d] border border-sage/20 flex items-center justify-center shrink-0">
                    <f.Icon className="w-4.5 h-4.5 text-sage" strokeWidth={1.5} />
                  </div>
                  <div className="pt-0.5">
                    <div className="font-sans text-sm font-black text-white leading-snug">{f.title}</div>
                    <div className="font-sans text-sm text-white/70 leading-relaxed mt-1">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>

        {/* ── Bottom trust stats bar ── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-white/[0.10] bg-[#07242b]/85 px-6 py-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {TRUST_STATS.map((s) => (
            <div key={s.title} className="flex items-center gap-3 border-r border-white/[0.08] last:border-r-0 pr-2">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.09] flex items-center justify-center shrink-0">
                <s.Icon className="w-4 h-4 text-sage/75" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-sans text-sm font-black text-white/92">{s.title}</div>
                <div className="font-sans text-[11px] text-white/60">{s.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
