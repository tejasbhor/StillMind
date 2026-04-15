"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import CustomCursor from "@/components/layout/CustomCursor";
import StatsSection from "@/components/landing/StatsSection";

// ── Scroll reveal hook ─────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Ambient orbs ───────────────────────────────────────────────────────────────
const ORBS = [
  { w: 420, h: 420, top: "-8%",  left: "-6%",  color: "#B8D4C0", anim: "animate-float-slow",   delay: "0s"    },
  { w: 280, h: 280, top: "18%",  left: "72%",  color: "#C4D4E8", anim: "animate-float-medium", delay: "1.2s"  },
  { w: 340, h: 340, top: "55%",  left: "-4%",  color: "#E8D4B0", anim: "animate-float-fast",   delay: "0.6s"  },
  { w: 200, h: 200, top: "70%",  left: "80%",  color: "#B8D4C0", anim: "animate-float-slow",   delay: "2s"    },
  { w: 260, h: 260, top: "35%",  left: "45%",  color: "#C4D4E8", anim: "animate-float-medium", delay: "0.3s"  },
  { w: 160, h: 160, top: "5%",   left: "52%",  color: "#E8F2EE", anim: "animate-float-fast",   delay: "1.8s"  },
];

// ── How it works steps ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Complete a short check-in",
    body: "A few thoughtful questions about how you've been feeling. Takes about four minutes — no clinical language, no judgment.",
  },
  {
    num: "02",
    title: "We find you the right support",
    body: "Our system quietly prioritises you based on how you're doing — ensuring those who need help most are seen first.",
  },
  {
    num: "03",
    title: "Connect with your counsellor",
    body: "You'll be matched with a counsellor, given a slot, and gently guided through confirming your appointment.",
  },
  {
    num: "04",
    title: "Track your wellbeing over time",
    body: "See your progress in calm, plain language. No scores, no graphs — just an honest reflection of how you're moving forward.",
  },
];

// ── Role preview cards ─────────────────────────────────────────────────────────
const ROLES = [
  {
    role: "Student",
    headline: "Your wellbeing, your pace.",
    description:
      "Check in when you're ready. View your appointments, chat with your counsellor, and see how you're moving forward — all in plain language.",
    accent: "#E8F2EE",
    border: "#B8D4C0",
    cta: "Student walkthrough →",
  },
  {
    role: "Counsellor",
    headline: "Focus on who needs you most.",
    description:
      "A clear priority queue, structured session notes, and full context for every student — so your limited hours go furthest.",
    accent: "#FEF4E0",
    border: "#E8D4B0",
    cta: "Counsellor walkthrough →",
  },
  {
    role: "Admin",
    headline: "Full visibility, privacy intact.",
    description:
      "Monitor system health, configure slot policies, and review aggregated trends — without ever accessing individual clinical data.",
    accent: "#E8EEF5",
    border: "#C4D4E8",
    cta: "Admin walkthrough →",
  },
];

// ── Principles ─────────────────────────────────────────────────────────────────
const PRINCIPLES = [
  { icon: "◎", title: "Explainability over Black Box", body: "Every decision answers 'Why was this student classified this way?' No silent algorithms." },
  { icon: "⊙", title: "Human-in-the-Loop",             body: "The system recommends — your counsellors decide. Always." },
  { icon: "◑", title: "Resource Optimisation",          body: "Finite counselling slots go to students with the greatest need, fairly." },
  { icon: "◐", title: "Privacy-First Design",           body: "Role-based access. Students never see scores. Admins never see notes." },
];

export default function LandingPage() {
  useScrollReveal();

  return (
    <>
      <CustomCursor />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-7 h-7 rounded-full bg-[#7BA89A]" />
          <span className="font-serif text-xl text-[#3D5A54]">StillMind</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="font-sans text-sm font-light text-[#3D5A54]/70 hover:text-[#3D5A54] transition-colors">How it works</a>
          <a href="#principles"   className="font-sans text-sm font-light text-[#3D5A54]/70 hover:text-[#3D5A54] transition-colors">Principles</a>
          <a href="#roles"        className="font-sans text-sm font-light text-[#3D5A54]/70 hover:text-[#3D5A54] transition-colors">Roles</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm px-5 py-2">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2">
            Register
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{ background: "linear-gradient(160deg, #E8F2EE 0%, #F5F3EF 55%, #EAE7E1 100%)" }}
        >
          {/* Ambient orbs */}
          {ORBS.map((orb, i) => (
            <div
              key={i}
              aria-hidden
              className={`orb ${orb.anim}`}
              style={{
                width: orb.w,
                height: orb.h,
                top: orb.top,
                left: orb.left,
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                animationDelay: orb.delay,
              }}
            />
          ))}

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center gap-7 max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-white/80 border border-[#B8D4C0] px-4 py-1.5 font-sans text-xs font-medium text-[#7BA89A] tracking-wider uppercase animate-fade-in">
              Campus mental health, rethought
            </span>

            <h1
              className="font-serif text-[clamp(2.6rem,6vw,4.25rem)] leading-[1.12] text-[#3D5A54] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Your campus has<br />a quiet corner.
            </h1>

            <p
              className="font-sans font-light text-lg text-[#3D5A54]/65 max-w-xl leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              StillMind connects students who need support with counsellors who can help —
              fairly, transparently, and without a waiting list you never knew you were on.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-3 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link href="/register" className="btn-primary text-base px-8 py-3.5">
                Begin your check-in
              </Link>
              <a href="#how-it-works" className="btn-ghost text-base px-8 py-3.5">
                See how it works
              </a>
            </div>

            <p
              className="font-sans text-xs font-light text-[#3D5A54]/40 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              Free for enrolled students · No clinical labels · Human counsellors in the loop
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
            <span className="font-sans text-xs font-light text-[#3D5A54]/40">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-[#B8D4C0] to-transparent" />
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-28 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="reveal text-center mb-16">
              <p className="font-sans text-xs font-medium text-[#7BA89A] tracking-widest uppercase mb-3">Process</p>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-[#3D5A54]">Simple by design.</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className={`reveal card p-8 flex flex-col gap-4`}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <span className="font-serif text-5xl text-[#B8D4C0]">{step.num}</span>
                  <h3 className="font-serif text-xl text-[#3D5A54]">{step.title}</h3>
                  <p className="font-sans font-light text-[0.9375rem] text-[#3D5A54]/65 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <StatsSection />

        {/* ── Principles ────────────────────────────────────────────────────── */}
        <section id="principles" className="py-28 px-6 bg-[#E8F2EE]">
          <div className="mx-auto max-w-5xl">
            <div className="reveal text-center mb-16">
              <p className="font-sans text-xs font-medium text-[#7BA89A] tracking-widest uppercase mb-3">Our commitments</p>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-[#3D5A54]">Built on four foundations.</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRINCIPLES.map((p, i) => (
                <div
                  key={p.title}
                  className="reveal flex flex-col gap-4 rounded-[20px] bg-white border border-[#B8D4C0] p-7"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <span className="text-3xl text-[#7BA89A]">{p.icon}</span>
                  <h3 className="font-serif text-lg text-[#3D5A54] leading-snug">{p.title}</h3>
                  <p className="font-sans font-light text-sm text-[#3D5A54]/65 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Role cards ────────────────────────────────────────────────────── */}
        <section id="roles" className="py-28 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="reveal text-center mb-16">
              <p className="font-sans text-xs font-medium text-[#7BA89A] tracking-widest uppercase mb-3">Who it's for</p>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-[#3D5A54]">One platform. Three roles.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {ROLES.map((r, i) => (
                <div
                  key={r.role}
                  className="reveal flex flex-col gap-5 rounded-[24px] border p-8"
                  style={{
                    background: r.accent,
                    borderColor: r.border,
                    transitionDelay: `${i * 0.1}s`,
                  }}
                >
                  <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">{r.role}</p>
                  <h3 className="font-serif text-xl text-[#3D5A54]">{r.headline}</h3>
                  <p className="font-sans font-light text-sm text-[#3D5A54]/70 leading-relaxed flex-1">{r.description}</p>
                  <span className="font-sans text-xs font-medium text-[#7BA89A]">{r.cta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-28 px-6">
          <div className="mx-auto max-w-2xl reveal text-center flex flex-col items-center gap-7">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "radial-gradient(circle, #B8D4C0, #7BA89A)" }}
            >
              <span className="text-white text-2xl">◎</span>
            </div>
            <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-[#3D5A54]">
              Ready to find your quiet corner?
            </h2>
            <p className="font-sans font-light text-[#3D5A54]/65 leading-relaxed max-w-md">
              StillMind is available to all enrolled students at participating institutions.
              Registration takes two minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary text-base px-8 py-3.5">
                Begin your check-in
              </Link>
              <Link href="/login" className="btn-ghost text-base px-8 py-3.5">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8F2EE] px-8 py-10">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded-full bg-[#7BA89A]" />
            <span className="font-serif text-lg text-[#3D5A54]">StillMind</span>
          </div>
          <p className="font-sans text-xs font-light text-[#3D5A54]/40 text-center">
            A rule-based, explainable mental health triage platform · v1.0 · April 2026
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A] transition-colors">Privacy</a>
            <a href="#" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A] transition-colors">Terms</a>
            <a href="#" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
