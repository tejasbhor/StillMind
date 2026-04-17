"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, scaleIn } from "@/utils/animations";

export default function Outcomes() {
  const cards = [
    {
      role: "Students",
      headline: "Feel guided, not lost.",
      body: "Get a clearer path to support when uncertainty feels heaviest. Private, reassuring, and designed to reduce anxiety.",
      href: "/register",
      cta: "Start the experience",
      dark: false,
    },
    {
      role: "Counselors",
      headline: "Focus on care, not sorting queues.",
      body: "Clearer prioritization means less administrative drag and more time for the work that matters.",
      href: "/register",
      cta: "Explore counselor workflow",
      dark: true,
    },
    {
      role: "Institutions",
      headline: "Bring structure and confidence.",
      body: "Improve response quality, allocate limited capacity more intelligently, and build operational confidence.",
      href: "/contact",
      cta: "Book a campus demo",
      dark: false,
    },
  ];

  return (
    <section id="outcomes" className="snap-section h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden px-6 pt-12">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          className="mb-6 lg:mb-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="text-xs font-black uppercase tracking-[0.3em] text-teal/75 mb-3 lg:mb-4 block">
            One Product. Three Critical Experiences.
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-5xl leading-[1.05] tracking-tight text-teal-dark max-w-xl">
            Better outcomes for{" "}
            <span className="text-sage italic font-normal">the people carrying the most.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`group relative overflow-hidden rounded-2xl lg:rounded-3xl flex flex-col justify-between p-5 lg:p-7 min-h-[240px] lg:min-h-[260px] cursor-default border transition-all duration-300 ${
                card.dark
                  ? "bg-teal border-teal hover:border-teal-light"
                  : "bg-[#FAFAF8] border-teal/[0.07] hover:border-teal/20 hover:shadow-float"
              }`}

              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i * 0.1}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <div className="flex flex-col gap-3 lg:gap-5 relative z-10">
                <span
                  className={`text-xs font-black uppercase tracking-[0.35em] ${
                    card.dark ? "text-sage" : "text-teal/75"
                  }`}
                >
                  {card.role}
                </span>
                <h3
                  className={`font-serif text-2xl lg:text-3xl leading-[1.1] tracking-tight ${
                    card.dark ? "text-white" : "text-teal-dark"
                  }`}
                >
                  {card.headline}
                </h3>
                <p
                  className={`font-sans text-sm leading-relaxed ${
                    card.dark ? "text-foam/90" : "text-teal/80"
                  }`}
                >
                  {card.body}
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <Link
                  href={card.href}
                  className={`inline-flex items-center gap-3 font-sans font-black text-xs uppercase tracking-[0.2em] transition-all group/cta ${
                    card.dark ? "text-white" : "text-teal/80 hover:text-teal"
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
  );
}
