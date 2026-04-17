import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ScrollManager from "@/components/layout/ScrollManager";
import Hero from "@/components/landing/Hero";
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
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      {/* Client-side layout helpers */}
      <CustomCursor />
      <ScrollProgress />
      <ScrollManager />

      {/* Navigation */}
      <Navbar />

      <main className="snap-container relative">
        <Hero />
        <Experience />
        <WhyStillMind />
        
        <section id="stats" className="snap-section">
          <StatsSection />
        </section>

        <Outcomes />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
