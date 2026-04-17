"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
} from "framer-motion";
import StatsSection from "@/components/landing/StatsSection";
import { AnimatedHero } from "@/components/motion/AnimatedHero";
import { MagneticHover } from "@/components/motion/Magnetic";

// ── Fade-up variant for Framer Motion ───────────────────────────
const springEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: springEase },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: springEase },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: springEase },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.1, ease: springEase },
  }),
};

// ── Custom Cursor ────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const hover = () => {
      dotRef.current?.classList.add("cursor-hover");
      ringRef.current?.classList.add("cursor-hover");
    };
    const unhover = () => {
      dotRef.current?.classList.remove("cursor-hover");
      ringRef.current?.classList.remove("cursor-hover");
    };
    const click = () => {
      dotRef.current?.classList.add("cursor-click");
      setTimeout(() => dotRef.current?.classList.remove("cursor-click"), 200);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("click", click);
    document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", hover);
      el.addEventListener("mouseleave", unhover);
    });

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top = `${pos.current.y}px`;
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("click", click);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden lg:block" />
      <div ref={ringRef} className="cursor-ring hidden lg:block" />
    </>
  );
}

// ── Scroll Progress Bar ──────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX, width: "100%" }}
    />
  );
}

// ── Magnetic Button ──────────────────────────────────────────────
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 3D Tilt Card ─────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -16, y: (px - 0.5) * 16 });
    setShine({ x: px * 100, y: py * 100 });
  };
  const handleLeave = () => { setTilt({ x: 0, y: 0 }); setShine({ x: 50, y: 50 }); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    // Watch the snap container scroll for nav state
    const container = document.querySelector("main.snap-container");
    if (!container) return;
    const onScroll = () => setNavScrolled(container.scrollTop > 60);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <ScrollProgress />

      {/* ── Navigation ──────────────────────────────────────────── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-5"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`max-w-6xl mx-auto flex items-center justify-between py-3 px-8 rounded-full transition-all duration-300 ${
          navScrolled
            ? "bg-white shadow-card border border-teal/[0.08]"
            : "bg-transparent"
        }`}>
          <Link href="/" className="flex items-center gap-3 group/logo">
            <motion.div
              className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.12, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="text-white font-serif text-xl font-bold italic">S</span>
            </motion.div>
            <span className="font-serif text-xl font-black tracking-tighter text-teal-dark">StillMind</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-12">
            {[
              { label: "The Experience", href: "#experience" },
              { label: "Our Story", href: "#principles" },
              { label: "Impact", href: "#stats" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-teal/60 hover:text-teal transition-all underline-reveal"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="font-sans text-[11px] font-black uppercase tracking-widest text-teal/70 hover:text-teal transition-all underline-reveal"
            >
              Sign In
            </Link>
            <MagneticButton>
              <Link
                href="/register"
                className="btn-primary !py-2.5 !px-7 !text-[11px] font-black uppercase tracking-widest shadow-md hover:shadow-float transition-all"
              >
                Get Started
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.header>

      <main className="snap-container relative">
        {/* ── Hero Section ──────────────────────────────────────── */}
        <section className="snap-section relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FCFCFA] px-6">
          {/* Premium animated background with flowing gradients */}
          <AnimatedHero />

          <motion.div
            className="max-w-6xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-20 items-center"
          >
            {/* Left: Copy */}
            <div className="flex flex-col gap-9">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 border border-teal/10 w-fit backdrop-blur-sm shadow-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-sage animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal/70">
                  Now live for 2026 intake
                </span>
              </motion.div>

              <div className="flex flex-col gap-5">
                <div className="overflow-hidden">
                  <motion.h1
                    className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.02] tracking-tight text-teal-dark"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                  >
                    Your campus <br />
                    has a{" "}
                    <motion.span
                      className="italic text-sage font-medium relative inline-block"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      quiet
                      <motion.span
                        className="absolute -bottom-1 left-0 h-[2px] bg-sage/50 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </motion.span>{" "}
                    <br />
                    corner.
                  </motion.h1>
                </div>
                <motion.div
                  className="w-16 h-[2px] bg-sage/40 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 64, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </div>

              <motion.p
                className="font-sans text-lg md:text-xl text-teal/70 max-w-lg leading-relaxed font-medium"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                No student should face a waitlist in their darkest hour.
                StillMind connects you with immediate care — skipping the queue
                to find peace in minutes.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-8 pt-2"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
              >
                <Link
                  href="/register"
                  className="btn-primary !py-4 !px-10 !text-[11px] font-black uppercase tracking-[0.2em] shadow-md"
                >
                  Begin your check-in
                </Link>
                <Link
                  href="#experience"
                  className="inline-flex items-center gap-3 group"
                >
                  <div className="w-11 h-11 rounded-full border border-teal/20 flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-white group-hover:border-teal transition-all duration-200">
                    <span className="ml-0.5 text-xs">&#9654;</span>
                  </div>
                  <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-teal/50 group-hover:text-teal transition-colors">
                    See how it works
                  </span>
                </Link>
              </motion.div>

              {/* Micro trust signals */}
              <motion.div
                className="flex items-center gap-6 pt-2"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5}
              >
                {["HIPAA", "ISO 27001", "End-to-End Encrypted"].map((label) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage/60" />
                    <span className="font-sans text-[9px] font-black uppercase tracking-widest text-teal/40">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Visual */}
            <motion.div
              className="hidden lg:block relative"
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <TiltCard className="relative group">
                <div className="relative z-10 rounded-[56px] overflow-hidden shadow-heavy aspect-[4/5] max-h-[70vh] ml-auto border-[8px] border-white/90">
                  <img
                    src="/hero-abstract.png"
                    alt="The Quiet Corner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal/50 via-transparent to-transparent" />

                  {/* Floating badge */}
                  <motion.div
                    className="absolute bottom-10 left-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <div className="glass px-6 py-2.5 rounded-full border-white/40 shadow-card">
                      <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white">
                        Find Peace First
                      </p>
                    </div>
                  </motion.div>

                  {/* Floating stat card */}
                  <motion.div
                    className="absolute top-8 right-8"
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 1.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="glass-strong px-5 py-4 rounded-2xl shadow-float">
                      <p className="font-serif text-2xl font-bold text-teal-dark">94%</p>
                      <p className="font-sans text-[9px] font-black uppercase tracking-widest text-teal/60 mt-0.5">
                        Feel heard
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Architectural frame */}
                <div className="absolute -inset-8 border border-teal/[0.05] rounded-[72px] pointer-events-none" />
                <div className="absolute -inset-16 border border-teal/[0.025] rounded-[88px] pointer-events-none" />
              </TiltCard>
            </motion.div>
          </motion.div>

          {/* Scroll indicator — bottom center */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.7 }}
          >
            <span className="font-sans text-[8px] font-black tracking-[0.4em] text-teal/30 uppercase">Scroll</span>
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-teal/30 to-transparent"
              animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        {/* ── Experience Section ────────────────────────────────── */}
        <section id="experience" className="snap-section h-screen flex items-center bg-[#0F2422] text-foam relative overflow-hidden">
          {/* Single ambient accent */}
          <div className="absolute top-[10%] right-[-8%] w-[45%] aspect-square rounded-full bg-sage/[0.08] blur-[140px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-8 w-full relative z-10 py-0">
            <div className="grid lg:grid-cols-2 gap-28 items-center">
              {/* Left: Steps */}
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.span
                  className="text-[11px] font-black uppercase tracking-[0.5em] text-sage mb-8 block"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={0}
                >
                  The Experience
                </motion.span>
                <motion.h2
                  className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.02] mb-10 text-white tracking-tight"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={1}
                >
                  Clarity in{" "}
                  <span className="text-sage italic">every step.</span>
                </motion.h2>

                <div className="space-y-8">
                  {[
                    {
                      title: "Immediate Connection",
                      desc: "No more silent waiting. From the moment you check-in, our secure protocol works to find you the right professional help instantly.",
                    },
                    {
                      title: "Understandable Support",
                      desc: "We translate complex assessment data into clear outcomes, ensuring that both you and your counselor have total clarity.",
                    },
                    {
                      title: "Lasting Progress",
                      desc: "Experience 1:1 care that evolves. Track your mental wellbeing through high-impact check-ins that guide your healing journey.",
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="group relative pl-20 cursor-default"
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-60px" }}
                      custom={idx + 2}
                      whileHover={{ x: 6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <motion.div
                        className="absolute left-0 top-1 text-3xl font-serif text-sage/30 group-hover:text-sage transition-all italic duration-500"
                        whileHover={{ scale: 1.1 }}
                      >
                        0{idx + 1}
                      </motion.div>
                      <h4 className="font-serif text-2xl mb-3 tracking-tight text-white/90 font-medium">
                        {item.title}
                      </h4>
                      <p className="font-sans text-base text-white/45 max-w-md leading-relaxed group-hover:text-white/65 transition-colors">
                        {item.desc}
                      </p>
                      <motion.div
                        className="absolute left-0 bottom-0 h-px bg-sage/20"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.2, duration: 0.8 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Actual product UI preview */}
              <motion.div
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                {/* Main card — check-in interface mockup */}
                <div className="relative rounded-[32px] bg-[#0D2420] border border-white/[0.08] overflow-hidden shadow-2xl">
                  {/* Card header */}
                  <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-sage/70">
                        Daily Check-in
                      </span>
                      <span className="font-sans text-[9px] text-white/20 uppercase tracking-widest">
                        Encrypted
                      </span>
                    </div>
                    <p className="font-serif text-xl text-white/90 mt-3">
                      How are you feeling today?
                    </p>
                  </div>

                  {/* Mood selector */}
                  <div className="px-8 py-6 border-b border-white/[0.06]">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Low", active: false },
                        { label: "Okay", active: true },
                        { label: "Good", active: false },
                      ].map((mood) => (
                        <div
                          key={mood.label}
                          className={`flex flex-col items-center gap-2 py-4 rounded-2xl border cursor-default transition-all ${
                            mood.active
                              ? "bg-sage/20 border-sage/40"
                              : "bg-white/[0.03] border-white/[0.06]"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${mood.active ? "bg-sage" : "bg-white/20"}`} />
                          <span className={`font-sans text-[10px] font-black uppercase tracking-widest ${mood.active ? "text-sage" : "text-white/30"}`}>
                            {mood.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress indicators */}
                  <div className="px-8 py-6 border-b border-white/[0.06] flex flex-col gap-4">
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                      Wellbeing Trend
                    </span>
                    <div className="flex items-end gap-1.5 h-10">
                      {[40, 55, 45, 70, 60, 80, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-sm bg-sage/40"
                          style={{ height: `${h}%` }}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status row */}
                  <div className="px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                      <span className="font-sans text-[10px] font-black uppercase tracking-widest text-white/50">
                        Counselor matched
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-sage/15 border border-sage/25 px-3 py-1.5 rounded-full">
                      <span className="font-sans text-[9px] font-black uppercase tracking-widest text-sage">
                        Green
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating notification card */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-float px-5 py-4 border border-teal/[0.08]"
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-sans text-[9px] font-black uppercase tracking-widest text-teal/40 mb-1">
                    Next session
                  </p>
                  <p className="font-serif text-sm text-teal-dark font-medium">Tomorrow, 2:00 PM</p>
                </motion.div>

                {/* Floating wait-time card */}
                <motion.div
                  className="absolute -bottom-5 -left-6 bg-teal rounded-2xl shadow-float px-5 py-4"
                  initial={{ opacity: 0, y: -16, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-sans text-[9px] font-black uppercase tracking-widest text-sage/70 mb-1">
                    Wait reduced
                  </p>
                  <p className="font-serif text-xl text-white font-medium">48 hrs</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Principles Section ────────────────────────────────── */}
        <section id="principles" className="snap-section h-screen flex items-center bg-[#FAFAF8] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-8 w-full relative z-10">
            {/* Header — left-aligned, editorial */}
            <div className="grid lg:grid-cols-2 gap-16 items-end mb-20">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal/40 mb-6 block">
                  Our Philosophy
                </span>
                <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] text-teal-dark tracking-tight">
                  Technology that{" "}
                  <span className="italic text-sage font-medium">prioritizes you.</span>
                </h2>
              </motion.div>
              <motion.p
                className="font-sans text-base text-teal/55 leading-relaxed lg:pb-2"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={1}
              >
                We built StillMind to bridge the gap between human empathy and intelligent scale — ensuring every student is heard, not just processed.
              </motion.p>
            </div>

            {/* Three principles — flush editorial grid */}
            <div className="grid md:grid-cols-3 gap-px bg-teal/[0.07] rounded-2xl overflow-hidden">
              {[
                {
                  n: "01",
                  t: "Radical Clarity",
                  d: "No clinical jargon. We translate complex assessments into a language of peace — one you can actually act on.",
                },
                {
                  n: "02",
                  t: "Fairness First",
                  d: "Our prioritization logic is ethical, transparent, and built to find those who need help most — not those who ask loudest.",
                },
                {
                  n: "03",
                  t: "Total Privacy",
                  d: "Role-based encryption ensures your sessions remain between you and your counselor. Always.",
                },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="group bg-[#FAFAF8] p-10 md:p-12 flex flex-col gap-8 cursor-default hover:bg-white transition-colors duration-500"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={i * 0.5}
                >
                  <span className="font-serif text-5xl text-teal/[0.08] group-hover:text-sage/25 transition-colors duration-700 leading-none select-none">
                    {p.n}
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-serif text-2xl tracking-tight text-teal-dark">{p.t}</h3>
                    <p className="font-sans text-sm text-teal/55 leading-relaxed">{p.d}</p>
                  </div>
                  <motion.div
                    className="h-[1.5px] bg-sage/30 rounded-full"
                    initial={{ width: "2rem" }}
                    whileHover={{ width: "4rem" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Section ─────────────────────────────────────── */}
        <section id="stats" className="snap-section">
          <StatsSection />
        </section>

        {/* ── Outcomes Section ──────────────────────────────────── */}
        <section id="social" className="snap-section h-screen flex items-center px-8 bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <motion.div
              className="mb-16"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal/40 mb-6 block">
                Who It Serves
              </span>
              <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-teal-dark max-w-xl">
                Outcome-driven for{" "}
                <span className="text-sage italic font-medium">everyone.</span>
              </h2>
            </motion.div>

            {/* Three role cards */}
            <div className="grid lg:grid-cols-3 gap-5">
              {[
                {
                  role: "Students",
                  headline: "Peace on your terms.",
                  body: "Skip the waiting room. Access therapeutic help precisely when you need it — not months later.",
                  href: "/register",
                  cta: "Start check-in",
                  dark: false,
                },
                {
                  role: "Counselors",
                  headline: "Impact where it matters.",
                  body: "Focus on healing. Let StillMind handle triage, ranking, and administrative overhead so you can do your best work.",
                  href: "/register",
                  cta: "Join as counselor",
                  dark: true,
                },
                {
                  role: "Institutions",
                  headline: "Resource clarity.",
                  body: "Manage high-volume campus needs with an ethical, transparent protocol for intelligent allocation.",
                  href: "/contact",
                  cta: "Get in touch",
                  dark: false,
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  className={`group relative overflow-hidden rounded-3xl flex flex-col justify-between p-10 min-h-[380px] cursor-default border transition-all duration-500 ${
                    card.dark
                      ? "bg-teal border-teal hover:border-teal-light"
                      : "bg-[#FAFAF8] border-teal/[0.07] hover:border-teal/20 hover:shadow-float"
                  }`}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={i * 0.5}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  {/* Top */}
                  <div className="flex flex-col gap-5 relative z-10">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.4em] ${
                        card.dark ? "text-sage/70" : "text-teal/40"
                      }`}
                    >
                      {card.role}
                    </span>
                    <h3
                      className={`font-serif text-3xl leading-[1.1] tracking-tight ${
                        card.dark ? "text-white" : "text-teal-dark"
                      }`}
                    >
                      {card.headline}
                    </h3>
                    <p
                      className={`font-sans text-sm leading-relaxed max-w-[26ch] ${
                        card.dark ? "text-foam/60" : "text-teal/55"
                      }`}
                    >
                      {card.body}
                    </p>
                  </div>

                  {/* Bottom CTA */}
                  <div className="relative z-10 mt-8">
                    <Link
                      href={card.href}
                      className={`inline-flex items-center gap-3 font-sans font-black text-[10px] uppercase tracking-[0.3em] transition-all group/cta ${
                        card.dark ? "text-sage hover:text-white" : "text-teal/50 hover:text-teal"
                      }`}
                    >
                      <span>{card.cta}</span>
                      <motion.span
                        className="inline-block"
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </div>

                  {/* Background accent */}
                  <div
                    className={`absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-[1.6] ${
                      card.dark ? "bg-sage/15" : "bg-sage/[0.06]"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────────── */}
        <section className="snap-section h-screen flex items-center px-8 relative overflow-hidden bg-teal">          {/* Single ambient accent */}
          <div className="absolute top-[-20%] right-[-10%] w-[45%] aspect-square rounded-full bg-sage/[0.12] blur-[120px] pointer-events-none" />

          <motion.div
            className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center gap-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-white font-serif text-3xl font-black italic">S</span>
            </motion.div>

            <div className="flex flex-col gap-6">
              <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-white">
                Begin your{" "}
                <span className="italic text-sage-light font-medium">fresh start.</span>
              </h2>
              <p className="font-sans text-lg text-foam/60 max-w-lg mx-auto leading-relaxed">
                Trusted by institutions that believe every student deserves immediate, dignified care.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <MagneticButton>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-3 bg-white text-teal font-sans font-black text-[11px] uppercase tracking-[0.25em] px-10 py-4 rounded-full hover:bg-foam transition-colors shadow-lg hover:shadow-float"
                >
                  Begin Check-in
                </Link>
              </MagneticButton>
              <Link
                href="/login"
                className="inline-flex items-center gap-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-sans font-black text-[11px] uppercase tracking-[0.25em] px-10 py-4 rounded-full transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 border-t border-white/10 w-full">
              {["HIPAA Compliant", "ISO 27001", "End-to-End Encrypted", "GDPR Ready"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-sage" />
                  <span className="font-sans text-[9px] font-black uppercase tracking-widest text-foam/40">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="py-16 px-10 border-t border-teal/[0.08] bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="font-serif text-2xl font-black tracking-tighter text-teal-dark">StillMind</span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-teal/30 border border-teal/10 px-2 py-0.5 rounded-full">
                v1.0
              </span>
            </div>
            <p className="font-sans text-xs text-teal/40 max-w-xs leading-relaxed">
              Ethical campus mental health infrastructure. Built for students, counselors, and institutions.
            </p>
          </div>

          <nav className="flex flex-wrap gap-8">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-teal/40 hover:text-teal transition-colors underline-reveal"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-teal/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-teal/20">
            © 2026 StillMind. All rights reserved.
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-teal/20">
            Secure · Scalable · Clinical Integrity · London
          </p>
        </div>
      </footer>
    </div>
  );
}