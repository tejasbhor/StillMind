"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Compass, Network } from "lucide-react";
import { AnimatedHero } from "@/components/motion/AnimatedHero";
import MagneticButton from "@/components/motion/MagneticButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { fadeUp } from "@/utils/animations";

export default function Hero() {
  return (
    <section className="snap-section relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FCFCFA] px-6 pt-20 lg:pt-24 pb-12">
      <AnimatedHero />

      <motion.div
        className="max-w-6xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      >
        {/* Left: Copy */}
        <div className="flex flex-col gap-4 lg:gap-7">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 border border-teal/10 w-fit backdrop-blur-sm shadow-sm"
          >
            <div className="flex h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(123,168,154,0.6)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-dark">
              Empowering campus partnerships with unparalleled support.
            </span>
          </motion.div>

          <div className="flex flex-col gap-5">
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-5xl md:text-6xl lg:text-[3.8rem] leading-[1.05] tracking-tight text-teal-dark font-normal"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                A clearer path <br /> to campus{" "}
                <motion.span
                  className="italic text-sage font-normal relative inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  well-being.
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[2px] bg-sage/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.span>
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
            className="font-sans text-lg md:text-xl text-teal/85 max-w-lg leading-relaxed font-medium"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            StillMind provides a rapid-response network for student 
            care. We help campuses guide with unparalleled clarity, 
            connecting students to the right support—faster.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <MagneticButton>
              <Link
                href="/contact"
                className="btn-primary !py-4 !px-10 !text-[13px] font-black uppercase tracking-[0.15em] shadow-xl hover:shadow-float transition-all hover:-translate-y-1 block"
              >
                Launch Partnership
              </Link>
            </MagneticButton>
            <Link
              href="#outcomes"
              className="group flex items-center gap-3 font-sans text-xs font-black uppercase tracking-[0.15em] text-teal/70 hover:text-teal transition-all"
            >
              <span className="underline-reveal">Explore Student Outcomes</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust badges row */}
          <motion.div
            className="flex flex-wrap items-center gap-4 lg:gap-8 pt-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            {[
              { label: "Privacy First", icon: ShieldCheck },
              { label: "Guidance Led", icon: Compass },
              { label: "Network Optimized", icon: Network },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-teal-dark/[0.04] border border-teal/5">
                <badge.icon className="w-4 h-4 text-teal/80" />
                <span className="text-xs font-black uppercase tracking-[0.1em] text-teal/85">
                  {badge.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Visual */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="relative z-10 w-full aspect-[4/5] md:aspect-[5/6] max-w-[420px] mx-auto group">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-white/90 via-white/40 to-white/10 backdrop-blur-[20px] border border-white/50 shadow-float overflow-hidden flex flex-col pt-12">
              <div className="px-10 mb-8 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-coral/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-sage/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-teal/40" />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-teal-dark/50">Secure Insight</div>
              </div>

              {/* Stat stack with premium typography */}
              <div className="flex-1 flex flex-col px-10 justify-center gap-10 pb-10">
                {[
                  { value: "98%", label: "Campus Adoption" },
                  { value: "0", label: "Waitlist Friction", italic: true },
                  { value: "24/7", label: "Student Coverage" }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-end justify-between border-b border-teal/5 pb-6 group/stat"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col">
                      <span className={`text-4xl md:text-5xl font-serif text-teal-dark leading-none group-hover/stat:text-sage transition-colors duration-500`}>
                        {stat.value}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-[0.2em] text-teal/75 mt-3 ${stat.italic ? 'italic' : ''}`}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal/[0.03] border border-teal/5 flex items-center justify-center group-hover/stat:bg-sage/10 transition-colors">
                      <div className="w-1 h-1 rounded-full bg-teal/20" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
