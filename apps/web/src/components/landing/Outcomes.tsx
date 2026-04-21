"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Users, MessageSquare, Building2, Shield, Heart, GraduationCap, BarChart3 } from "lucide-react";
import { fadeUp, scaleIn } from "@/utils/animations";

export default function Outcomes() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yParallax = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [28, -22]
  );

  const cards = [
    {
      role: "Students",
      headline: "Feel guided,\nnot lost.",
      body: "Get a clearer path to support when uncertainty feels heaviest. Private, reassuring, and designed to reduce anxiety.",
      href: "/register",
      cta: "Start the experience →",
      dark: false,
      icon: Users,
    },
    {
      role: "Counselors",
      headline: "Focus on care,\nnot sorting queues.",
      body: "Clearer prioritization means less administrative drag and more time for the work that matters.",
      href: "/register",
      cta: "Explore counselor workflow →",
      dark: true,
      icon: MessageSquare,
    },
    {
      role: "Institutions",
      headline: "Bring structure\nand confidence.",
      body: "Improve response quality, allocate limited capacity more intelligently, and build operational confidence.",
      href: "/contact",
      cta: "Book a campus demo →",
      dark: false,
      icon: Building2,
    },
  ];

  const features = [
    { label: "Privacy-first by design", icon: Shield },
    { label: "Human-centered support", icon: Heart },
    { label: "Built for higher education", icon: GraduationCap },
    { label: "Actionable insights", icon: BarChart3 },
  ];

  return (
    <section
      ref={sectionRef}
      id="outcomes"
      className="snap-section h-screen flex flex-col items-center justify-center bg-[#F7F6F2] relative overflow-hidden px-6"
    >
      <motion.div
        style={{ y: yParallax }}
        className="pointer-events-none absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-sage/10 blur-[120px]"
      />
      
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          className="mb-8 lg:mb-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal/70 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            One Product. Three Critical Experiences.
          </span>
          
          <h2 className="font-serif text-[2.3rem] leading-[1.06] text-teal-dark sm:text-[3.3rem] lg:text-[3.5rem] max-w-3xl">
            Better outcomes for{" "}
            <span className="italic text-sage">the people carrying the most.</span>
          </h2>
          
          <p className="mt-4 max-w-xl text-[0.97rem] font-medium leading-[1.75] text-teal/75 md:text-[1.05rem]">
            StillMind streamlines student support, reduces complexity for teams, and strengthens institutional confidence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i * 0.1}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className={`group relative overflow-hidden rounded-2xl p-5 lg:p-6 flex flex-col ${
                  card.dark
                    ? "bg-[#1a3d3a] border border-teal/20"
                    : "bg-white/90 border border-teal/[0.07]"
                }`}
              >
                <div className="flex flex-col gap-4 relative z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    card.dark ? "bg-white/10" : "bg-teal/5"
                  }`}>
                    <Icon className={`h-5 w-5 ${card.dark ? "text-sage" : "text-teal/70"}`} />
                  </div>
                  
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                        card.dark ? "text-sage/80" : "text-teal/60"
                      }`}
                    >
                      {card.role}
                    </span>
                    <h3
                      className={`font-serif text-xl lg:text-2xl leading-[1.2] mt-2 whitespace-pre-line ${
                        card.dark ? "text-white" : "text-teal-dark"
                      }`}
                    >
                      {card.headline}
                    </h3>
                    <div className={`h-px w-12 mt-3 ${card.dark ? "bg-sage/30" : "bg-teal/20"}`} />
                  </div>
                  
                  <p
                    className={`font-sans text-sm leading-relaxed ${
                      card.dark ? "text-foam/80" : "text-teal/70"
                    }`}
                  >
                    {card.body}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-4">
                  <Link
                    href={card.href}
                    className={`inline-flex items-center gap-2 font-sans text-xs font-black uppercase tracking-[0.15em] transition-colors ${
                      card.dark
                        ? "text-white hover:text-sage"
                        : "text-teal/80 hover:text-teal"
                    }`}
                  >
                    {card.cta}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-teal/10 bg-white/80 px-6 py-3 backdrop-blur"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-teal/60">
                  {feature.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
