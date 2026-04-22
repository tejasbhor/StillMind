import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import ContactForm from "@/components/landing/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | StillMind",
  description: "Get in touch with StillMind for institutional partnerships, demos, or technical support.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="min-h-screen pt-32 lg:pt-40 pb-20 px-6">
        <div className="max-w-[1440px] mx-auto w-full space-y-8">
          <section className="rounded-3xl border border-teal/10 bg-white p-7 md:p-10">
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-teal/60">
              Contact StillMind
            </span>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight tracking-tight text-teal-dark">
              Reach the right team quickly.
            </h1>
            <p className="mt-4 max-w-3xl font-sans text-teal/80 leading-relaxed">
              Use the contact form below for general inquiries. For privacy, security, or legal requests, use the dedicated channels so we can route your request correctly.
            </p>
          </section>

          <section id="support" className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: "Sales", value: "sales@stillmind.com", note: "Demos and institutional partnerships" },
              { title: "Support", value: "support@stillmind.com", note: "Product and account support" },
              { title: "Privacy", value: "privacy@stillmind.com", note: "Data rights and privacy requests" },
              { title: "Security", value: "security@stillmind.com", note: "Security reports and concerns" },
              { title: "Legal", value: "legal@stillmind.com", note: "Terms and legal notices" },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-teal/10 bg-white p-5">
                <p className="font-sans text-[10px] font-black uppercase tracking-[0.22em] text-teal/55">
                  {item.title}
                </p>
                <p className="mt-2 font-sans text-sm font-semibold text-teal-dark break-all">{item.value}</p>
                <p className="mt-2 font-sans text-xs text-teal/70 leading-relaxed">{item.note}</p>
              </article>
            ))}
          </section>

          <section id="partnerships">
            <ContactForm />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
