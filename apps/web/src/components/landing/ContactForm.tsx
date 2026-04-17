"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { fadeUp, fadeIn, scaleIn } from "@/utils/animations";
import MagneticButton from "@/components/motion/MagneticButton";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <motion.div 
        className="mx-auto max-w-md text-center py-20"
        initial="hidden"
        animate="visible"
        variants={scaleIn}
      >
        <div className="w-20 h-20 rounded-3xl bg-sage/20 border border-sage/30 flex items-center justify-center mx-auto mb-8 shadow-sm">
          <motion.span 
            className="text-sage text-3xl font-black italic"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            ✓
          </motion.span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-teal-dark mb-4 tracking-tight">Message Sent</h1>
        <p className="font-sans text-teal/60 mb-10 leading-relaxed">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible, usually within 24-48 hours.
        </p>
        <MagneticButton>
          <Link href="/" className="btn-primary text-[11px] font-black uppercase tracking-[0.2em] px-10 py-4 shadow-float">
            Back to Home
          </Link>
        </MagneticButton>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        className="text-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-sage mb-6 block">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-teal-dark mb-6 tracking-tight">
          How can we <span className="text-sage italic font-normal">help you?</span>
        </h1>
        <p className="font-sans text-teal/55 text-lg leading-relaxed max-w-xl mx-auto">
          Have questions about implementation, partnerships, or just want to say hello? Our team is ready to assist.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-10">
        <motion.div 
          className="lg:col-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0.2}
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-teal/[0.08] p-8 md:p-10 shadow-float-sm space-y-7 transition-all hover:shadow-float duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label htmlFor="name" className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40 ml-1">
                  Your Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="px-6 py-4 rounded-2xl bg-teal/[0.02] border border-teal/[0.1] font-sans text-sm text-teal-dark focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/5 transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40 ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-6 py-4 rounded-2xl bg-teal/[0.02] border border-teal/[0.1] font-sans text-sm text-teal-dark focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/5 transition-all"
                  placeholder="you@institution.edu"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="subject" className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40 ml-1">
                Subject of Inquiry
              </label>
              <select
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="px-6 py-4 rounded-2xl bg-teal/[0.02] border border-teal/[0.1] font-sans text-sm text-teal-dark focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/5 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.2rem] bg-[right_1.5rem_center] bg-no-repeat"
              >
                <option value="" disabled>Select a topic</option>
                <option value="demo">Book a Demo</option>
                <option value="partnership">Institutional Partnership</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other Questions</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="message" className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40 ml-1">
                Your Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="px-6 py-4 rounded-3xl bg-teal/[0.02] border border-teal/[0.1] font-sans text-sm text-teal-dark focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/5 transition-all resize-none"
                placeholder="Tell us how we can support your campus goals..."
              />
            </div>

            <MagneticButton>
              <button type="submit" className="w-full btn-primary text-[11px] font-black uppercase tracking-[0.25em] py-5 rounded-2xl shadow-float hover:scale-[1.01] transition-all">
                Send Message
              </button>
            </MagneticButton>
          </form>
        </motion.div>

        <motion.div 
          className="lg:col-span-2 space-y-6 flex flex-col justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0.4}
        >
          <div className="bg-[#0F2422] rounded-[32px] p-8 md:p-10 text-foam relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <h3 className="font-serif text-2xl text-white mb-4 italic">For Students</h3>
            <p className="font-sans text-sm text-foam/60 leading-relaxed mb-6">
              If you are a student, please contact your institution&apos;s counseling center for immediate support. StillMind is a platform provided through your campus.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-sage">Available 24/7 for crises</span>
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-[32px] p-8 md:p-10 border border-teal/[0.06] shadow-sm group hover:border-teal/20 transition-all duration-500">
            <h3 className="font-serif text-2xl text-teal-dark mb-4">Partnerships</h3>
            <p className="font-sans text-sm text-teal/60 leading-relaxed mb-6">
              Interested in integrating StillMind at your university? Our partnership team is available for deep-dive sessions.
            </p>
            <a href="mailto:partnerships@stillmind.edu" className="font-serif text-lg text-teal hover:text-teal-dark transition-colors italic border-b border-teal/20 pb-1">
              partnerships@stillmind.edu
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
