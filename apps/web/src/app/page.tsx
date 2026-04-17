"use client";

import { useEffect } from "react";
import Link from "next/link";
import StatsSection from "@/components/landing/StatsSection";

// ── Readability-Focused Scroll Reveal ───────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
}

export default function LandingPage() {
  useScrollReveal();

  return (
    <div className="bg-[#FCFCFA] min-h-screen selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      {/* ── Navigation (High Contrast & Precise) ──────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 group">
        <div className="max-w-6xl mx-auto flex items-center justify-between glass py-3 px-8 rounded-full shadow-soft border-white/60 transition-all duration-500 group-hover:shadow-float">
          <Link href="/" className="flex items-center gap-3 group/logo">
            <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center shadow-lg transition-transform group-hover/logo:scale-110">
              <span className="text-white font-serif text-xl font-bold italic">S</span>
            </div>
            <span className="font-serif text-xl font-black tracking-tighter text-teal-dark">StillMind</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-12">
            {[
              { label: "The Experience", href: "#experience" },
              { label: "Our Story", href: "#principles" },
              { label: "Partner Network", href: "#stats" }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-teal/60 hover:text-teal transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-8">
            <Link href="/login" className="font-sans text-[11px] font-black uppercase tracking-widest text-teal/80 hover:text-teal transition-all">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary !py-2.5 !px-8 !text-[11px] font-black uppercase tracking-widest shadow-md hover:shadow-float active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* ── Hero Section (Meticulous Readability & Hierarchy) ──────── */}
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FCFCFA] px-6">
          {/* Refined Ambient Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-5%] w-[50%] aspect-square rounded-full bg-sage/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-haze/5 blur-[120px]" />
          </div>

          <div className="max-w-6xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-24 items-center">
            <div className="flex flex-col gap-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 border border-teal/10 w-fit backdrop-blur-sm shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-sage animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal/70">Now live for 2026 intake</span>
              </div>
              
              <div className="flex flex-col gap-6">
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-teal-dark">
                  Your campus <br /> has a <span className="italic text-sage font-medium">quiet</span> <br /> corner.
                </h1>
                <div className="w-16 h-[2px] bg-sage/40 rounded-full" />
              </div>

              <p className="font-sans text-lg md:text-xl text-teal/75 max-w-lg leading-relaxed font-medium">
                We believe no student should face a waitlist in their darkest hour. 
                StillMind connects you with immediate care, skipping the queue to find peace in minutes.
              </p>

              <div className="flex flex-wrap items-center gap-10 pt-4">
                <Link href="/register" className="btn-primary !py-5 !px-14 text-sm font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-float hover:-translate-y-1 transition-all">
                  Begin your check-in
                </Link>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-teal/20 flex items-center justify-center text-teal shadow-soft group-hover:bg-teal group-hover:text-white transition-all transform group-hover:scale-110">
                     <span className="ml-1">▶</span>
                  </div>
                  <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-teal/50 group-hover:text-teal transition-colors">Our Story</span>
                </div>
              </div>
            </div>

            {/* Desktop Hero Visual (Meticulous White Space & Framing) */}
            <div className="hidden lg:block relative">
              <div className="relative z-10 rounded-[64px] overflow-hidden shadow-heavy aspect-[4/5] max-h-[68vh] group ml-auto transition-all duration-1000 border-[10px] border-white">
                <img 
                  src="/hero-abstract.png" 
                  alt="The Quiet Corner" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal/40 via-transparent to-transparent opacity-30" />
                
                {/* Minimal Overlay Badge */}
                <div className="absolute bottom-10 left-10">
                   <div className="glass px-6 py-2.5 rounded-full border-white/40 shadow-card">
                       <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white">Find Peace First</p>
                   </div>
                </div>
              </div>
              {/* Architectural Frame Element */}
              <div className="absolute -inset-10 border border-teal/[0.04] rounded-[80px] pointer-events-none" />
            </div>
          </div>

          {/* Trusted Institution Bar (Enhanced Contrast) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-12 flex justify-between items-center bg-white/10 backdrop-blur-sm py-4">
            <span className="font-sans text-[9px] font-black uppercase tracking-[0.5em] text-teal/40">Official Partners</span>
            <div className="flex gap-16 items-center">
               {["Standish", "Oxford", "Hartwell", "Lakewood"].map(u => (
                 <span key={u} className="font-serif text-xl tracking-tighter italic font-bold text-teal/50 hover:text-teal transition-colors cursor-default">{u}</span>
               ))}
            </div>
            <div className="flex flex-col items-center gap-2">
               <span className="text-[8px] font-black tracking-[0.4em] text-teal/30">SCROLL</span>
               <div className="w-px h-10 bg-gradient-to-b from-teal/30 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── Experience Section (Enhanced Readability) ────────────── */}
        <section id="experience" className="min-h-screen flex items-center bg-[#152F2E] text-foam relative overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0">
             <div className="absolute top-[20%] right-[-10%] w-[60%] aspect-square rounded-full bg-sage/10 blur-[150px]" />
             <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-white/5 blur-[120px]" />
          </div>

          <div className="max-w-6xl mx-auto px-8 w-full relative z-10 py-24">
             <div className="grid lg:grid-cols-2 gap-32 items-center">
                <div className="reveal">
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-sage mb-8 block">The Experience</span>
                   <h2 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-16 text-white tracking-tight">Clarity in <br /><span className="text-sage italic">every step.</span></h2>
                   
                   <div className="space-y-16">
                      {[
                        { title: "Immediate Connection", desc: "No more silent waiting. From the moment you check-in, our secure protocol works to find you the right professional help instantly." },
                        { title: "Understandable Support", desc: "We translate complex assessment data into clear outcomes, ensuring that both you and your counselor have total clarity." },
                        { title: "Lasting Progress", desc: "Experience 1:1 care that evolves. Track your mental wellbeing through high-impact check-ins that guide your healing journey." }
                      ].map((item, idx) => (
                        <div key={idx} className="group relative pl-20">
                           <div className="absolute left-0 top-1 text-3xl font-serif text-sage/40 group-hover:text-sage transition-all italic duration-500">0{idx+1}</div>
                           <h4 className="font-serif text-3xl mb-4 tracking-tight text-white/90 font-medium">{item.title}</h4>
                           <p className="font-sans text-lg text-white/50 max-w-md leading-relaxed group-hover:text-white/70 transition-colors">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="reveal">
                   <div className="glass-dark aspect-square rounded-[80px] border border-white/10 flex flex-col items-center justify-center p-20 relative overflow-hidden group shadow-2xl">
                      <div className="relative z-10 w-28 h-28 rounded-full bg-white/5 flex items-center justify-center mb-14 shadow-inner group-hover:scale-110 transition-transform duration-1000">
                         <span className="text-5xl font-serif text-foam italic">S</span>
                         <div className="absolute inset-[-10px] rounded-full border border-sage/30 animate-spin-slow" />
                      </div>
                      <h3 className="relative z-10 font-serif text-3xl mb-4 text-center text-white">Your Portal</h3>
                      <p className="relative z-10 font-sans text-xs text-white/30 text-center uppercase tracking-[0.4em] mb-16">Encrypted • Real-time Protocol</p>
                      
                      <div className="relative z-10 flex flex-col gap-5 w-full">
                         <div className="glass py-4 px-8 rounded-24 border-white/10 text-center shadow-lg">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/80">Premium Check-in Interface</span>
                         </div>
                         <div className="glass py-4 px-8 rounded-24 border-white/10 text-center shadow-lg">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/80">Direct Clinical Matchmaking</span>
                         </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sage/30 blur-[120px] pointer-events-none" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ── Story Section (High-Readability Canvas) ──────────────── */}
        <section id="principles" className="py-44 bg-white relative">
          <div className="max-w-6xl mx-auto px-8 relative z-10">
            <div className="reveal text-center mb-36 max-w-3xl mx-auto">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal/40 mb-8 block font-sans">Our Outcome Philosophy</span>
               <h2 className="font-serif text-5xl md:text-7xl leading-tight text-teal-dark tracking-tighter">Technology that <br /><span className="italic text-sage font-medium opacity-80">prioritizes you.</span></h2>
               <p className="font-sans text-xl text-teal/70 mt-12 leading-relaxed font-medium">We built StillMind to bridge the gap between human empathy and intelligent scale, ensuring that every student is heard.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-16">
               {[
                 { t: "Radical Clarity", d: "No more clinical jargon or complex reports. We translate medical assessments into a language of peace." },
                 { t: "Fairness First", d: "Our prioritization logic is ethical, transparent, and built to find those who need help most." },
                 { t: "Total Privacy", d: "Role-based encryption ensures your personal sessions remain between you and your counselor." }
               ].map((p, i) => (
                 <div key={i} className="reveal group flex flex-col items-center text-center gap-10 cursor-default">
                    <div className="w-20 h-20 rounded-[28px] bg-foam flex items-center justify-center text-3xl font-serif text-teal italic group-hover:bg-teal group-hover:text-white transition-all duration-700 shadow-sm group-hover:shadow-lg">0{i+1}</div>
                    <div className="flex flex-col gap-6">
                       <h3 className="font-serif text-3xl tracking-tight text-teal-dark">{p.t}</h3>
                       <p className="font-sans text-[17px] text-teal/65 leading-relaxed max-w-xs mx-auto font-medium">{p.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <section id="stats">
           <StatsSection />
        </section>

        {/* ── Stakeholder Outcomes (Impeccable Contrast) ──────────── */}
        <section id="social" className="py-44 px-8 bg-[#FBFBFA]">
           <div className="max-w-6xl mx-auto flex flex-col items-center">
              <div className="reveal text-center mb-32 max-w-4xl mx-auto">
                 <h2 className="font-serif text-5xl md:text-7xl leading-tight tracking-tight text-teal-dark">Outcome driven for <br/><span className="text-sage italic font-medium">everyone.</span></h2>
                 <p className="font-sans text-xl text-teal/60 mt-8 font-medium italic">Empowering the three pillars of academic mental health.</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-16 w-full">
                 {[
                   { r: "Students", h: "Peace on your terms.", d: "Skip the waiting room. Access therapeutic help precisely when you need it, skipping the months of uncertainty." },
                   { r: "Counselors", h: "Impact where it matters.", d: "Focus on what you do best—healing. Let StillMind handle the triage, ranking, and administrative overhead." },
                   { r: "Institutions", h: "Resource optimization.", d: "Manage high-volume campus needs with an ethical protocol for intelligent resource allocation." }
                 ].map((role, i) => (
                   <div key={i} className="reveal group relative overflow-hidden glass p-16 rounded-[80px] border border-white transition-all duration-1000 cursor-pointer shadow-soft hover:shadow-float-lg bg-white/40">
                      <div className="relative z-10 flex flex-col items-center gap-14 text-center">
                         <span className="text-[11px] font-black uppercase tracking-[0.5em] text-teal/50 group-hover:text-teal transition-colors font-sans">{role.r}</span>
                         <div className="flex flex-col gap-6">
                            <h3 className="font-serif text-4xl leading-[1.1] tracking-tight text-teal">{role.h}</h3>
                            <p className="font-sans text-[17px] text-teal/65 leading-relaxed max-w-xs mx-auto font-medium">{role.d}</p>
                         </div>
                         <div className="w-14 h-14 rounded-full border border-teal/10 flex items-center justify-center text-2xl group-hover:bg-teal group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">↗</div>
                      </div>
                      <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-teal/[0.03] rounded-full group-hover:scale-[3] transition-transform duration-[3000ms] blur-3xl" />
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── Conclusion (Meticulous Statement) ───────────────────── */}
        <section className="h-[95vh] flex items-center justify-center px-8 relative overflow-hidden bg-white">
          <div className="reveal relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
             <div className="w-20 h-20 rounded-[28px] bg-teal flex items-center justify-center shadow-heavy mb-16 transform hover:rotate-12 transition-transform duration-700">
                <span className="text-white font-serif text-4xl font-black italic">S</span>
             </div>
             <h2 className="font-serif text-6xl md:text-8xl leading-[0.9] tracking-tighter mb-14 text-teal-dark">
                Begin your <br /><span className="italic text-sage font-medium opacity-90">fresh start.</span>
             </h2>
             <p className="font-sans text-2xl text-teal/60 max-w-lg mb-16 leading-relaxed font-medium">Trusted by world-class educational leaders. Join our institutional network and redefine student support.</p>
             <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto">
                <Link href="/register" className="btn-primary !px-20 !py-6 text-sm shadow-float uppercase tracking-[0.3em] font-black hover:scale-105 active:scale-95 transition-all">Begin Check-in</Link>
             </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-sage/[0.02] -skew-y-2 origin-bottom-right" />
        </section>
      </main>

      <footer className="py-28 px-10 border-t border-foam bg-[#FCFCFA] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-20">
          <div className="flex items-center gap-6">
             <span className="font-serif text-3xl font-black tracking-tighter text-teal-dark">StillMind</span>
             <div className="h-6 w-[2px] bg-teal/10" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal/40">Ethical Framework • v1.0</span>
          </div>
          <div className="flex gap-16 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-teal/50">
             <a href="#" className="hover:text-teal transition-colors">Privacy Privacy</a>
             <a href="#" className="hover:text-teal transition-colors">Ethics Protocol</a>
             <a href="#" className="hover:text-teal transition-colors">Institutional Contact</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-teal/20">Secure • Scalable • Clinical Integrity • London 2026</p>
        </div>
      </footer>
    </div>
  );
}