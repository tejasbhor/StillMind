"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MagneticButton from "@/components/motion/MagneticButton";
import { fadeUp } from "@/utils/animations";

export default function CTA() {
  return (
    <section id="cta" className="snap-section h-screen flex flex-col items-center justify-center bg-teal relative overflow-hidden px-6 pt-12">
      <div className="absolute top-[-20%] right-[-10%] w-[45%] aspect-square rounded-full bg-sage/[0.12] blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center gap-5 lg:gap-8 w-full"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"
          whileHover={{ rotate: 12, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-white font-serif text-2xl font-black italic">S</span>
        </motion.div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <h2 className="font-serif text-4xl md:text-7xl leading-[0.95] tracking-tight text-white">
            Build a better <span className="italic text-sage-light font-medium">first step.</span>
          </h2>
          <p className="font-sans text-base md:text-lg text-foam/90 max-w-lg mx-auto leading-relaxed">
            StillMind helps campuses deliver earlier support, calmer experiences, and clearer institutional confidence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <MagneticButton>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-white text-teal font-sans font-black text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-foam transition-colors shadow-lg hover:shadow-float"
            >
              Book a Demo
            </Link>
          </MagneticButton>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 border border-white/20 text-white/95 hover:text-white hover:border-white/40 font-sans font-black text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-full transition-all"
          >
            Talk to Our Team
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 pt-4 border-t border-white/10 w-full">
          {[
            "Privacy-first by design", 
            "Built for high-volume campus demand", 
            "Human-centered support", 
            "Clear oversight for campus teams"
          ].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-sage" />
              <span className="font-sans text-[11px] font-black uppercase tracking-widest text-foam/75">
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
