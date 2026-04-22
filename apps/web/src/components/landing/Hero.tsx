"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import Logo from "@/components/brand/Logo";
import { fadeUp } from "@/utils/animations";

export default function Hero() {
  const featurePills = [
    { label: "Faster response", sublabel: "Triaged in minutes.", icon: Zap },
    { label: "Human-centered", sublabel: "Real people, real care.", icon: Heart },
    { label: "Privacy first", sublabel: "Enterprise-grade security.", icon: ShieldCheck },
    { label: "Actionable insights", sublabel: "Data that drives change.", icon: BarChart3 },
  ];

  const timelineCards = [
    {
      title: "I'm feeling overwhelmed and could use support.",
      meta: "Student message",
      time: "2 min ago",
      icon: Sparkles,
    },
    {
      title: "Rapid Triage",
      meta: "Assessed and routed to the right counselor.",
      time: "2 min",
      icon: CheckCircle2,
    },
    {
      title: "Care Team Notified",
      meta: "Counselor alerted and prepares to connect.",
      time: "3 min",
      icon: Heart,
    },
    {
      title: "Support Delivered",
      meta: "Student connected. Support in progress.",
      time: "15 min",
      icon: CheckCircle2,
    },
  ];
  const TimelineCard2Icon = timelineCards[1].icon;
  const TimelineCard3Icon = timelineCards[2].icon;
  const TimelineCard4Icon = timelineCards[3].icon;

  return (
    <section className="snap-section relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[#F7F6F2] px-6 pt-24 pb-12 lg:min-h-screen lg:pt-32 lg:pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[14%] h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute right-[5%] top-[20%] h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute right-[18%] bottom-[22%] h-56 w-56 rounded-full bg-emerald-100/40 blur-2xl" />
      </div>

      <motion.div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-7 lg:grid-cols-[1.03fr_1fr] lg:gap-9 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-teal/15 bg-white/90 px-4 py-2 shadow-sm backdrop-blur"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal/80" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-dark">
              Trusted by 100+ institutions worldwide
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-[2.3rem] leading-[1.06] text-teal-dark sm:text-[3.3rem] lg:text-[3.95rem]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Student support
            <br />
            that's <span className="italic text-sage">faster,</span>
            <br />
            <span className="italic text-sage">kinder, smarter.</span>
          </motion.h1>

          <motion.p
            className="max-w-[37rem] text-[0.97rem] font-medium leading-[1.75] text-teal/85 md:text-[1.08rem]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            StillMind is the rapid-response network for student care. We help campuses
            deliver earlier support, calmer experiences, and clearer institutional confidence.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            {featurePills.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-teal/10 bg-white/80 px-3 py-2 shadow-sm backdrop-blur"
              >
                <div className="mb-2 flex items-center gap-2 text-teal-dark">
                  <item.icon className="h-3.5 w-3.5 text-sage" />
                  <span className="text-xs font-black uppercase tracking-[0.12em]">{item.label}</span>
                </div>
                <p className="text-xs leading-relaxed text-teal/70">{item.sublabel}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-4 pt-1"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <MagneticButton>
              <Link
                href="/contact"
                className="btn-primary !px-7 !py-3 !text-[12px] font-black uppercase tracking-[0.15em]"
              >
                Launch Partnership
              </Link>
            </MagneticButton>
            <Link
              href="#outcomes"
              className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.14em] text-teal-dark transition hover:bg-teal-dark hover:text-white"
            >
              See How It Works
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div
            className="space-y-3 pt-1"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal/65">
              Secure. Compliant. Built for higher education.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-teal/55">
              <span>HIPAA compliant</span>
              <span>ISO 27001 certified</span>
              <span>End-to-end encrypted</span>
              <span>GDPR ready</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative hidden min-h-[530px] lg:block"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="absolute inset-0">
            {[0, 1, 2].map((ring) => (
              <div
                key={ring}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/10"
                style={{ width: `${220 + ring * 110}px`, height: `${220 + ring * 110}px` }}
              />
            ))}
          </div>

          <div className="absolute left-1/2 top-[49%] z-10 flex h-[152px] w-[152px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-teal/15 bg-white shadow-lg">
            <Logo variant="iconOnly" iconSize="lg" suppressLink className="pointer-events-none" />
            <span className="mt-1 text-base font-serif font-bold text-teal-dark">StillMind</span>
          </div>

          <div className="absolute left-2 top-8 z-20 w-56 rounded-2xl border border-teal/10 bg-white/95 p-3.5 shadow-lg">
            <p className="text-sm text-teal/85">{timelineCards[0].title}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-teal/55">
              <span>{timelineCards[0].meta}</span>
              <span>{timelineCards[0].time}</span>
            </div>
          </div>

          <div className="absolute right-1 top-10 z-20 w-56 rounded-2xl border border-teal/10 bg-white/95 p-3.5 shadow-lg">
            <div className="mb-2 flex items-center gap-2 text-teal-dark">
              <TimelineCard2Icon className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">{timelineCards[1].title}</p>
            </div>
            <p className="text-xs leading-relaxed text-teal/70">{timelineCards[1].meta}</p>
            <p className="mt-2 text-xs text-teal/55">{timelineCards[1].time}</p>
          </div>

          <div className="absolute left-4 top-[228px] z-20 w-56 rounded-2xl border border-teal/10 bg-white/95 p-3.5 shadow-lg">
            <div className="mb-2 flex items-center gap-2 text-teal-dark">
              <TimelineCard3Icon className="h-4 w-4 text-sage" />
              <p className="text-sm font-semibold">{timelineCards[2].title}</p>
            </div>
            <p className="text-xs leading-relaxed text-teal/70">{timelineCards[2].meta}</p>
            <p className="mt-2 text-xs text-teal/55">{timelineCards[2].time}</p>
          </div>

          <div className="absolute right-2 top-[246px] z-20 w-56 rounded-2xl border border-teal/10 bg-white/95 p-3.5 shadow-lg">
            <div className="mb-2 flex items-center gap-2 text-teal-dark">
              <TimelineCard4Icon className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold">{timelineCards[3].title}</p>
            </div>
            <p className="text-xs leading-relaxed text-teal/70">{timelineCards[3].meta}</p>
            <p className="mt-2 text-xs text-teal/55">{timelineCards[3].time}</p>
          </div>

          <div className="absolute bottom-[-8px] left-1/2 z-20 w-[24.4rem] -translate-x-1/2 rounded-2xl border border-teal/10 bg-white/95 p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-teal-dark">Institutional Impact</p>
              <Link href="#stats" className="text-xs font-semibold text-teal/70 hover:text-teal">
                View all stats
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                ["1200+", "Students supported"],
                ["94%", "Feel heard"],
                ["48h", "Median time saved"],
                ["3x", "Faster triage"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-teal/10 bg-[#fafbf9] px-2 py-2.5 text-center">
                  <p className="text-[1.45rem] font-serif leading-none text-teal-dark">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-teal/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={6}
        className="relative z-10 mt-8 w-full max-w-[1440px] mx-auto rounded-full border border-teal/10 bg-white/80 px-6 py-3 text-center backdrop-blur"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal/55">
          Powering student well-being across campuses
        </p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-8 gap-y-1.5 text-[13px] font-semibold text-teal/45">
          <span>Northwood University</span>
          <span>Midwest State University</span>
          <span>Pine Hill College</span>
          <span>Riverdale University</span>
          <span>and 500+ more institutions</span>
        </div>
      </motion.div>
    </section>
  );
}
