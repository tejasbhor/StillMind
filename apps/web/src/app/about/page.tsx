import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollManager from "@/components/layout/ScrollManager";
import ScrollProgress from "@/components/layout/ScrollProgress";
import AboutHero from "@/components/landing/AboutHero";
import AboutSections from "@/components/landing/AboutSections";
import CTA from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: "About Us | StillMind",
  description: "Learn about StillMind's mission to improve campus mental-health support through privacy-first, human-centered technology.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <ScrollProgress />
      <ScrollManager />
      
      <Navbar />

      <main className="pt-24 lg:pt-32">
        <AboutHero />
        <AboutSections />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
