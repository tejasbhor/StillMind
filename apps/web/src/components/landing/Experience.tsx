"use client";

import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight } from "@/utils/animations";

export default function Experience() {
  return (
    <section id="experience" className="snap-section h-screen flex flex-col items-center justify-center bg-[#0F2422] text-foam relative overflow-hidden px-6 pt-16">
      <div className="absolute top-[10%] right-[-8%] w-[45%] aspect-square rounded-full bg-sage/[0.08] blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.span
              className="text-xs font-black uppercase tracking-[0.3em] text-sage mb-4 block"
              variants={fadeUp}
              custom={0}
            >
              The Experience
            </motion.span>
            <motion.h2
              className="font-serif text-3xl md:text-5xl lg:text-[3.5rem] leading-[1.02] mb-4 text-white tracking-tight"
              variants={fadeUp}
              custom={1}
            >
              Calm on the surface.{" "}
              <span className="text-sage italic">Powerful where it matters.</span>
            </motion.h2>
            <motion.p
              className="font-sans text-sm md:text-base text-white/85 max-w-md mb-8 leading-relaxed"
              variants={fadeUp}
              custom={1}
            >
              Designed to feel calm for students, useful for counselors, and dependable for institutions.
            </motion.p>

            <div className="space-y-4">
              {[
                {
                  title: "For Students",
                  desc: "A private, guided path to support with language that feels reassuring instead of clinical.",
                },
                {
                  title: "For Counselors",
                  desc: "Clearer prioritization, better session flow, and less administrative drag.",
                },
                {
                  title: "For Institutions",
                  desc: "Better visibility into demand and capacity with privacy boundaries built locally.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="group relative pl-16 cursor-default"
                  variants={fadeUp}
                  custom={idx + 2}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <motion.div
                    className="absolute left-0 top-1 text-2xl font-serif text-sage/75 group-hover:text-sage transition-all italic duration-500"
                  >
                    0{idx + 1}
                  </motion.div>
                  <h4 className="font-serif text-xl md:text-2xl mb-1.5 tracking-tight text-white/90 font-medium">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-white/75 max-w-md leading-relaxed group-hover:text-white transition-colors">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>


          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative rounded-[32px] bg-[#0D2420] border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-xs font-black uppercase tracking-[0.25em] text-sage">
                    Daily Check-in
                  </span>
                  <span className="font-sans text-[11px] text-white/50 uppercase tracking-widest">
                    Encrypted
                  </span>
                </div>
                <p className="font-serif text-xl text-white/90 mt-3">
                  How are you feeling today?
                </p>
              </div>

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
                      <span className={`font-sans text-xs font-black uppercase tracking-widest ${mood.active ? "text-sage" : "text-white/60"}`}>
                        {mood.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                  <span className="font-sans text-xs font-black uppercase tracking-widest text-white/80">
                    Counselor matched
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
