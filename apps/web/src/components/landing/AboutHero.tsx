"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Compass, Users } from "lucide-react";
import { fadeUp, fadeIn } from "@/utils/animations";

export default function AboutHero() {
  return (
    <section className="px-6 lg:px-8 py-16 lg:py-20 relative overflow-hidden">
      {/* Mesh background effect */}
      <div className="absolute top-0 right-0 w-[50%] aspect-square rounded-full bg-sage/[0.05] blur-[120px] pointer-events-none" />
      
      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeIn} custom={0} className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sage">
            About StillMind
          </span>
        </motion.div>
        
        <motion.h1 
          variants={fadeUp}
          custom={1}
          className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] tracking-tight text-teal-dark"
        >
          StillMind is a campus mental-health support product designed to improve how students are guided to care, how counselors focus their time, and how institutions understand demand without losing sight of dignity and privacy.
        </motion.h1>

        {/* Trust microcopy */}
        <motion.div
          className="flex flex-wrap items-center gap-6 pt-12"
          variants={fadeUp}
          custom={2}
        >
          {[
            { label: "Privacy-First Design", icon: ShieldCheck },
            { label: "Rapid Clarity Guidance", icon: Compass },
            { label: "Collaborative Partner Network", icon: Users }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/75 border border-teal/[0.08] backdrop-blur-md shadow-sm hover:bg-white transition-all duration-300 group">
              <item.icon className="w-4 h-4 text-teal group-hover:scale-110 transition-transform" strokeWidth={2} />
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.15em] text-teal-dark">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
