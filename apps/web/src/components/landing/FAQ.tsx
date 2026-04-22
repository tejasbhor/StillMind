"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp } from "@/utils/animations";

const faqs = [
  {
    q: "Is StillMind a replacement for counselors?",
    a: "No. StillMind helps teams identify need earlier and support prioritization, while counselors remain central to care decisions. The product is designed to enhance human judgment, not replace it.",
  },
  {
    q: "What do students see?",
    a: "Students get a guided, private experience with clear next steps, appointments, and safe progress views. They are not overwhelmed with internal scoring or complex system logic.",
  },
  {
    q: "What do institutions see?",
    a: "Institutions get operational visibility into capacity, demand, and system performance, without access to sensitive session-level clinical details.",
  },
  {
    q: "Can StillMind fit existing campus workflows?",
    a: "Yes. The product is designed to support real-world resource limits, counselor workflows, and institutional governance needs locally.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yAccent = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="snap-section min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] relative overflow-hidden px-6 pt-24 pb-16 lg:pt-32"
    >
      <motion.div
        style={{ y: yAccent }}
        className="pointer-events-none absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-teal/10 blur-[120px]"
      />
      <div className="max-w-[1440px] mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 lg:mb-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="text-xs font-black uppercase tracking-[0.3em] text-teal/75 mb-4 lg:mb-6 block">
            Common Questions
          </span>
          <h2 className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-tight text-teal-dark">
            Questions?{" "}
            <span className="text-sage italic font-medium">We have answers.</span>
          </h2>
        </motion.div>

        <div className="space-y-3 lg:space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl border border-teal/[0.08] overflow-hidden hover:shadow-card transition-all duration-300 card-shine"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              custom={i * 0.1}
              whileHover={{ y: -2 }}
            >
              <div className="p-5 lg:p-7">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-serif text-xl lg:text-2xl text-teal-dark">{faq.q}</h3>
                  <span className="shrink-0 rounded-full border border-teal/10 bg-teal/[0.03] px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest text-teal/60">
                    FAQ
                  </span>
                </div>
                <p className="font-sans text-sm md:text-base text-teal/85 leading-relaxed">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
