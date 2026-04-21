"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Users, ShieldCheck, BarChart3, Building2,
  MessageSquare, Clock, Zap, CheckCircle2,
  TrendingUp, Smile, Timer, Star,
} from "lucide-react";

/* ─── Mini charts ─── */
function TrendUp({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 80 32" className="w-20 h-8" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(123,168,154,0.28)" />
          <stop offset="100%" stopColor="rgba(123,168,154,0)" />
        </linearGradient>
      </defs>
      <path d="M0,28 C14,24 28,20 40,14 C52,8 64,10 80,3" stroke="rgba(123,168,154,0.8)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M0,28 C14,24 28,20 40,14 C52,8 64,10 80,3 L80,32 L0,32 Z" fill={`url(#${id})`} />
    </svg>
  );
}

function BarsMini() {
  const vals = [0.38, 0.52, 0.44, 0.63, 0.55, 0.74, 0.62, 0.85, 0.72, 0.92];
  return (
    <svg viewBox="0 0 80 32" className="w-20 h-8">
      {vals.map((h, i) => (
        <rect key={i} x={i * 8 + 1} y={32 - h * 28} width="5" height={h * 28} rx="1.5"
          fill={`rgba(123,168,154,${0.3 + h * 0.55})`} />
      ))}
    </svg>
  );
}

function RingProgress({ pct }: { pct: number }) {
  const r = 18; const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="w-11 h-11">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="#7BA89A" strokeWidth="4"
        strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="900"
        fill="white" fontFamily="sans-serif">{pct}%</text>
    </svg>
  );
}

function DualLine() {
  return (
    <svg viewBox="0 0 200 50" className="w-full h-full" fill="none" preserveAspectRatio="none">
      <path d="M4,44 C24,40 44,38 64,32 C84,26 104,28 124,20 C144,12 164,10 196,5"
        stroke="rgba(123,168,154,0.85)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4,47 C24,45 44,43 64,40 C84,37 104,35 124,30 C144,25 164,22 196,18"
        stroke="rgba(96,165,250,0.75)" strokeWidth="1.5" strokeLinecap="round" />
      {["Jun","Aug","Oct","Dec","Feb","Apr"].map((m, i) => (
        <text key={m} x={4 + i * 38} y="50" fontSize="4.5" fill="rgba(255,255,255,0.25)" fontFamily="sans-serif">{m}</text>
      ))}
    </svg>
  );
}

/* ─── World dot backdrop ─── */
function WorldDots() {
  const pts = [
    [14,18],[17,21],[13,26],[21,24],[16,30],
    [21,40],[18,44],[25,46],
    [42,18],[46,16],[50,19],[44,22],[47,14],
    [43,34],[47,38],[44,42],[50,36],
    [60,16],[66,18],[72,20],[62,13],[70,24],[58,20],[76,16],
    [72,43],[76,46],[69,47],
  ];
  return (
    <svg viewBox="0 0 90 60" className="w-full h-full opacity-60" aria-hidden>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.7" fill="rgba(123,168,154,0.55)" />
      ))}
      {[[20,24],[46,18],[65,18]].map(([x, y], i) => (
        <circle key={`h${i}`} cx={x} cy={y} r="2.8" fill="rgba(123,168,154,0.12)"
          stroke="rgba(123,168,154,0.35)" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

/* ─── Animated counter ─── */
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 1400, 1);
      setN(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref}>{n}</span>;
}

/* ─── Growth pill ─── */
function GrowthBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage/10 border border-sage/20">
      <TrendingUp className="w-2.5 h-2.5 text-sage" />
      <span className="font-sans text-[9px] font-black text-sage">{text}</span>
    </div>
  );
}

/* ─── Data ─── */
const STAT_CARDS = [
  { value: 94, suffix: "%", Icon: MessageSquare, label: "Feel heard",       sub: "Students felt their voice was acknowledged",      badge: "18% vs last year", chart: "trend" as const, chartId: "t1" },
  { value: 48, suffix: "h", Icon: Clock,          label: "Wait time saved",  sub: "Median hours reduced in response time",           badge: "40% improvement",  chart: "bar"   as const, chartId: "b1" },
  { value: 3,  suffix: "x", Icon: Zap,            label: "Faster triage",    sub: "Vs. manual processes",                            badge: "3x efficiency",    chart: "trend" as const, chartId: "t2" },
  { value: 89, suffix: "%", Icon: CheckCircle2,   label: "Resolution rate",  sub: "Issues resolved in first interaction",            badge: "22% vs last year", chart: "ring"  as const, chartId: "r1" },
];

const FEATURES = [
  { Icon: ShieldCheck, title: "Trusted & Secure",        desc: "Enterprise-grade security and privacy you can rely on." },
  { Icon: BarChart3,   title: "Actionable Insights",     desc: "Turning feedback into meaningful improvements that drive impact." },
  { Icon: Building2,   title: "Built for Institutions",  desc: "Designed to scale across campuses and student populations." },
];

const PROGRESS_BARS = [
  { Icon: Smile, label: "Student satisfaction", value: 94 },
  { Icon: Timer, label: "Timely responses",      value: 88 },
  { Icon: Star,  label: "Support quality",       value: 91 },
];

const COMPLIANCE = ["HIPAA Compliant", "ISO 27001 Certified", "End-to-End Encrypted", "GDPR Ready"];
const INSTITUTIONS = ["Northwood University", "Midwest State", "Pine Hill College", "Riverdale University"];

/* ─── Section ─── */
export default function StatsSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yBloom = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [20, -20]);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="snap-section relative flex h-screen flex-col overflow-hidden bg-[#041c22] px-6 pt-24 lg:pt-28 pb-[34px]"
    >
      {/* Ambient */}
      <motion.div style={{ y: yBloom }}
        className="pointer-events-none absolute top-[-10%] right-[-5%] w-[44%] aspect-square rounded-full bg-sage/[0.10] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-4%] w-[30%] aspect-square rounded-full bg-teal/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_28%,rgba(123,168,154,0.07),transparent_65%)]" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-4 lg:gap-5 flex-1 justify-center">

        {/* ── Row 1: Copy | Hero stat | Feature list ── */}
        <div className="grid grid-cols-[1fr_1.75fr_1fr] gap-4 lg:gap-5 flex-none">

          {/* Left */}
          <motion.div className="flex flex-col justify-center gap-2.5 pt-1"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-sage/80">Global Impact</span>
            <h2 className="font-serif text-4xl lg:text-[3.65rem] leading-[1.03] tracking-tight text-white font-normal">
              Data that<br /><span className="text-sage">matters.</span>
            </h2>
            <p className="font-sans text-base text-white/75 leading-relaxed max-w-[240px]">
              Real outcomes from real students across our institutional network—driving better support and stronger communities.
            </p>
          </motion.div>

          {/* Center hero stat */}
          <motion.div
            className="relative bg-[#0b2d34]/80 border border-white/[0.12] rounded-2xl overflow-hidden flex flex-col items-center justify-center py-5 px-4 gap-2 shadow-[0_20px_70px_rgba(2,30,36,0.38)]"
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-80 scale-110">
              <WorldDots />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(123,168,154,0.16),transparent_65%)]" />
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center mb-0.5">
                <Users className="w-4.5 h-4.5 text-sage" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-7xl lg:text-[7.1rem] text-white leading-none tracking-tight font-normal">
                <Counter value={1200} />
              </span>
              <span className="font-sans text-sm font-bold text-white/85">Students supported</span>
              <span className="font-sans text-[11px] text-white/60">Across 12+ partner institutions globally</span>
              <GrowthBadge text="35% growth this year" />
            </div>
          </motion.div>

          {/* Right: Feature list */}
          <motion.div className="flex flex-col gap-2 pt-1"
            initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-2.5 rounded-xl border border-white/[0.08] bg-[#0a2b31]/55">
                <div className="w-7 h-7 rounded-lg bg-sage/12 flex items-center justify-center shrink-0 mt-0.5">
                  <f.Icon className="w-3 h-3 text-sage" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-sans text-xs font-black text-white leading-snug">{f.title}</div>
                  <div className="font-sans text-[11px] text-white/70 leading-relaxed mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Row 2: 4 Stat cards ── */}
        <div className="grid grid-cols-4 gap-4 lg:gap-6 flex-none">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={s.label}
              className="bg-[#0b2d34]/75 border border-white/[0.10] rounded-2xl p-3.5 flex flex-col gap-2 hover:border-sage/30 transition-colors duration-400"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">
                  <s.Icon className="w-3 h-3 text-sage" strokeWidth={1.5} />
                </div>
                <span className="font-serif text-3xl text-white leading-none font-normal">
                  <Counter value={s.value} />{s.suffix}
                </span>
              </div>
              <div>
                <div className="font-sans text-xs font-black text-white">{s.label}</div>
                <div className="font-sans text-[11px] text-white/60 leading-relaxed">{s.sub}</div>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <GrowthBadge text={s.badge} />
                {s.chart === "trend" && <TrendUp id={s.chartId} />}
                {s.chart === "bar"   && <BarsMini />}
                {s.chart === "ring"  && <RingProgress pct={89} />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Row 3: Improving / Progress bars / Dual line ── */}
        <div className="grid grid-cols-[1fr_1.9fr_2.2fr] gap-4 lg:gap-6 flex-none">

          {/* Label */}
          <div className="bg-[#0b2d34]/75 border border-white/[0.10] rounded-xl p-3.5 flex flex-col justify-center gap-1">
            <div className="font-sans text-sm font-black text-white">Improving every day</div>
            <div className="font-sans text-xs text-white/60 leading-relaxed">
              Consistent progress across key experience metrics.
            </div>
          </div>

          {/* Progress bars */}
          <div className="bg-[#0b2d34]/75 border border-white/[0.10] rounded-xl p-3.5 flex flex-col justify-center gap-2.5">
            {PROGRESS_BARS.map((pb) => (
              <div key={pb.label} className="flex items-center gap-2">
                <pb.Icon className="w-3 h-3 text-white/50 shrink-0" strokeWidth={1.5} />
                <span className="font-sans text-[11px] text-white/75 w-[110px] shrink-0">{pb.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-sage"
                    initial={{ width: 0 }} whileInView={{ width: `${pb.value}%` }}
                    viewport={{ once: true }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
                </div>
                <span className="font-sans text-[11px] font-black text-white/90 w-7 text-right">{pb.value}%</span>
              </div>
            ))}
          </div>

          {/* Dual line chart */}
          <div className="bg-[#0b2d34]/75 border border-white/[0.10] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-sans text-xs font-black text-white">Data-driven decisions</div>
                <div className="font-sans text-[11px] text-white/60 leading-relaxed">
                  Insights that help institutions act and create real change.
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-sage" />
                  <span className="font-sans text-[10px] text-white/50">Satisfaction</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400/80" />
                  <span className="font-sans text-[10px] text-white/50">Resolution Rate</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 h-10">
              <DualLine />
            </div>
          </div>
        </div>

        {/* ── Row 4: Compliance footer ── */}
        <div className="flex items-center justify-center gap-8 border-t border-white/[0.08] pt-4 flex-none">
          <div className="flex items-center gap-6">
            {COMPLIANCE.map((c) => (
              <div key={c} className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage/60" />
                <span className="font-sans text-[10px] font-black uppercase tracking-wide text-white/70">{c}</span>
              </div>
            ))}
          </div>
          <div className="w-px h-6 bg-white/[0.12]" />
          <div className="flex items-center gap-8">
            <span className="font-sans text-[10px] text-white/60 shrink-0 leading-tight">Trusted by institutions<br />across the globe</span>
            <div className="flex items-center gap-6">
              {INSTITUTIONS.map((n) => (
                <span key={n} className="font-sans text-[10px] font-black uppercase tracking-wide text-white/50">{n}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
