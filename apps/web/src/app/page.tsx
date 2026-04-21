import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import CustomCursor from "@/components/layout/CustomCursor";
import Hero from "@/components/landing/Hero";
import LandingMarquee from "@/components/landing/LandingMarquee";
import Experience from "@/components/landing/Experience";
import WhyStillMind from "@/components/landing/WhyStillMind";
import StatsSection from "@/components/landing/StatsSection";
import Outcomes from "@/components/landing/Outcomes";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "StillMind | Institutional Mental Health Decision Support",
  description: "Transforming campus mental health through privacy-first, human-in-the-loop decision support systems for educational institutions.",
  openGraph: {
    title: "StillMind | A Clearer Path to Campus Well-being",
    description: "Empowering campus partnerships with unparalleled support and institutional-grade clarity.",
    images: ["/hero-mesh.png"],
  },
};

export default function LandingPage() {
  return (
    <div className="relative bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_18%_18%,rgba(123,168,154,0.2),transparent_56%)]" />
        <div className="absolute right-0 top-[20rem] h-[36rem] w-[36rem] rounded-full bg-sage/10 blur-[120px]" />
        <div className="absolute left-[-8rem] top-[110rem] h-[30rem] w-[30rem] rounded-full bg-teal/10 blur-[140px]" />
      </div>

      {/* Client-side layout helpers */}
      <CustomCursor />

      {/* Navigation */}
      <Navbar />

      <main className="snap-container relative z-10">
        <Hero />
        <LandingMarquee />
        <Experience />
        <WhyStillMind />
        <StatsSection />
        <Outcomes />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
