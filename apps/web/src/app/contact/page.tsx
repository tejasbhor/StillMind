import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollManager from "@/components/layout/ScrollManager";
import ContactForm from "@/components/landing/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | StillMind",
  description: "Get in touch with StillMind for institutional partnerships, demos, or technical support.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <ScrollManager />
      
      <Navbar />

      <main className="min-h-screen pt-32 lg:pt-40 pb-20 px-6">
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
