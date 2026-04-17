"use client";

import { motion } from "framer-motion";
import { Users, Compass, Building2, Heart, Eye, Lock, Sparkles } from "lucide-react";
import { fadeUp, fadeIn } from "@/utils/animations";

const sections = [
  {
    id: "mission",
    tagline: "OUR MISSION",
    headline: "We exist to help campuses respond sooner, more clearly, and more compassionately when students need support.",
    body: "We believe no student should have to sit in uncertainty when asking for help. StillMind is built to make the first step toward support feel clearer, calmer, and easier to trust.",
    dark: false,
  },
  {
    id: "problem",
    tagline: "THE PROBLEM",
    headline: "Rising demand. Limited capacity. Growing strain.",
    body: "Across many institutions, demand for mental-health support is rising while counseling capacity remains limited. That creates long waits, uneven prioritization, and too much strain on the people responsible for care.",
    dark: true,
  },
  {
    id: "what-we-do",
    tagline: "WHAT STILLMIND DOES",
    headline: "Clearer paths, focused care, and visible outcomes.",
    body: "StillMind helps institutions guide students toward support more effectively, helps counselors focus where support is most needed, and gives campus teams clearer visibility into service delivery. The product is designed around privacy, fairness, and calm user experience.",
    dark: false,
  },
  {
    id: "who-we-serve",
    tagline: "WHO WE SERVE",
    headline: "Built for every stakeholder in campus wellbeing.",
    body: "",
    dark: true,
    features: [
      {
        icon: Users,
        title: "Students",
        desc: "Who need a clearer first step toward support."
      },
      {
        icon: Compass,
        title: "Counselors", 
        desc: "Who need better prioritization and less operational friction."
      },
      {
        icon: Building2,
        title: "Institutions",
        desc: "That need confidence, structure, and privacy-conscious oversight."
      }
    ]
  },
  {
    id: "principles",
    tagline: "OUR PRINCIPLES",
    headline: "What guides every decision we make.",
    body: "",
    dark: false,
    features: [
      {
        icon: Heart,
        title: "Student dignity comes first",
        desc: "Every interaction preserves the student's agency and humanity."
      },
      {
        icon: Eye,
        title: "Human care stays central",
        desc: "Technology supports counselors; it never replaces them."
      },
      {
        icon: Lock,
        title: "Privacy built in, not added later",
        desc: "Boundaries are enforced by design, not just policy."
      },
      {
        icon: Sparkles,
        title: "Clarity over complexity",
        desc: "Systems should help people act with confidence, not add more confusion."
      }
    ]
  }
];

export default function AboutSections() {
  return (
    <div className="flex flex-col">
      {sections.map((section, idx) => (
        <motion.section
          key={section.id}
          id={section.id}
          className={`px-6 lg:px-8 py-16 lg:py-24 relative overflow-hidden ${
            section.dark ? "bg-[#0F2422] text-foam" : "bg-[#FAFAF8]"
          }`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {section.dark && (
            <div className="absolute top-0 left-0 w-full h-full bg-teal/[0.02] pointer-events-none" />
          )}
          
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Section Header */}
            {section.headline && (
              <motion.div className="mb-8 lg:mb-12" variants={fadeUp} custom={0}>
                <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${
                  section.dark ? "text-sage" : "text-teal/40"
                }`}>
                  {section.tagline}
                </span>
                <h2 className={`font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight mt-6 ${
                  section.dark ? "text-white" : "text-teal-dark font-medium"
                }`}>
                  {section.headline}
                </h2>
              </motion.div>
            )}

            {/* Body Text */}
            {section.body && (
              <motion.p 
                variants={fadeUp}
                custom={1}
                className={`text-base lg:text-lg leading-relaxed max-w-2xl ${
                  section.dark ? "text-foam/60" : "text-teal/70"
                }`}
              >
                {section.body}
              </motion.p>
            )}

            {/* Feature Cards */}
            {section.features && (
              <div className={`grid ${section.features.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-5 mt-12`}>
                {section.features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    custom={i * 0.15}
                    className={`group relative overflow-hidden rounded-2xl lg:rounded-3xl flex flex-col justify-between p-7 lg:p-9 min-h-[200px] cursor-default border transition-all duration-500 ${
                      section.dark 
                        ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20" 
                        : "bg-white border-teal/[0.06] hover:border-teal/20 hover:shadow-float shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col gap-5">
                      <feature.icon className={`w-6 h-6 transition-transform duration-500 group-hover:scale-110 ${
                        section.dark ? "text-sage" : "text-teal/60"
                      }`} strokeWidth={1.5} />
                      <div className="space-y-3">
                        <h3 className={`font-serif text-xl lg:text-2xl leading-[1.1] tracking-tight ${
                          section.dark ? "text-white" : "text-teal-dark"
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          section.dark ? "text-foam/65" : "text-teal/60 font-medium"
                        }`}>
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
