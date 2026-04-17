"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/utils/animations";

export default function WhyStillMind() {
  const principles = [
    {
      n: "01",
      t: "Student Dignity First",
      d: "The experience is built to reduce uncertainty, not add to it. Clear language, visible progress, and a sense of agency throughout.",
    },
    {
      n: "02",
      t: "Human Judgment Stays Central",
      d: "Counselors remain the decision-makers in care delivery. StillMind supports their expertise; it never replaces it.",
    },
    {
      n: "03",
      t: "Clear and Fair Prioritization",
      d: "Support is directed with consistency and transparency under real-world capacity limits.",
    },
    {
      n: "04",
      t: "Privacy Built Into the Product",
      d: "Different users see only what they need. Privacy boundaries are enforced by design, not just policy.",
    },
  ];

  return (
    <section id="why" className="snap-section h-screen flex flex-col items-center justify-center bg-[#FAFAF8] relative overflow-hidden px-6 pt-16">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-end mb-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-teal/75 mb-4 block">
              Why Campuses Choose StillMind
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.05] text-teal-dark tracking-tight">
              Built for trust.{" "}
              <span className="italic text-sage font-normal">Designed for care.</span>
            </h2>
          </motion.div>
          <motion.p
            className="font-sans text-sm md:text-base text-teal/80 leading-relaxed lg:pb-1"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={1}
          >
            StillMind brings together student dignity, counselor effectiveness, and institutional clarity in one privacy-first platform.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-teal/[0.07] rounded-2xl overflow-hidden">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              className="group bg-[#FAFAF8] p-6 md:p-8 flex flex-col gap-4 cursor-default hover:bg-white transition-colors duration-500"

              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i * 0.1}
            >
              <span className="font-serif text-5xl text-teal/[0.12] group-hover:text-sage/40 transition-colors duration-700 leading-none select-none">
                {p.n}
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl tracking-tight text-teal-dark">{p.t}</h3>
                <p className="font-sans text-sm text-teal/75 leading-relaxed">{p.d}</p>
              </div>
              <motion.div
                className="h-[1.5px] bg-sage/60 rounded-full"
                initial={{ width: "2rem" }}
                whileHover={{ width: "4rem" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
