import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Rights & Data Requests | StillMind",
  description:
    "Request access, correction, deletion, or a copy of personal information associated with StillMind.",
};

export default function PrivacyRequestsPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="min-h-screen pt-32 lg:pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <section className="rounded-3xl border border-teal/10 bg-white/75 backdrop-blur-xl shadow-soft p-7 md:p-10">
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-teal/60">
              Privacy Rights
            </span>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight tracking-tight text-teal-dark">
              Data requests should feel straightforward — not intimidating.
            </h1>
            <p className="mt-4 max-w-3xl font-sans text-teal/80 leading-relaxed">
              Depending on your location and relationship with StillMind (for example, whether you access StillMind
              through a campus), you may have rights to access, correct, delete, restrict, object to, or request a copy
              of certain personal information.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-teal/45">
              <span>Last updated: April 18, 2026</span>
              <span className="w-1 h-1 rounded-full bg-teal/20" />
              <span>Version 1.0</span>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <article className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">Common request types</h2>
              <ul className="space-y-3">
                {[
                  "Access: receive a copy of information associated with your account (where applicable).",
                  "Correction: update inaccurate account or profile information.",
                  "Deletion: request deletion of certain personal information (subject to legal, security, or contractual requirements).",
                  "Restriction / objection: limit certain processing in some circumstances.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-teal/80">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">Important context</h2>
              <p className="font-sans text-teal/80 leading-relaxed">
                StillMind is often made available by an institution. In some cases, requests may need to be coordinated
                with the institution or subject to institutional policies and legal obligations.
              </p>
              <p className="mt-4 font-sans text-teal/80 leading-relaxed">
                We may also need to retain certain records for security, auditability, dispute resolution, or to comply
                with contractual and legal requirements.
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">How to submit a request</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Email",
                  text: "Send your request to privacy@stillmind.com with the subject “Privacy Request”.",
                },
                {
                  title: "From your institution",
                  text: "If you access StillMind via a campus, your institution may provide an internal privacy contact or process.",
                },
                {
                  title: "Contact form",
                  text: "You can also reach us through the contact page and select the privacy route.",
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-teal/10 bg-[#FAFAF8] p-6">
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.22em] text-teal/55">
                    {card.title}
                  </p>
                  <p className="mt-3 font-sans text-sm text-teal/80 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:privacy@stillmind.com?subject=Privacy%20Request"
                className="btn-primary !font-black"
              >
                Email Privacy Team
              </a>
              <Link href="/contact" className="btn-outline !font-medium">
                Go to Contact
              </Link>
              <Link href="/privacy" className="btn-ghost !text-teal !border-teal/20">
                Read Privacy Policy
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-teal/10 bg-teal p-7 md:p-10 text-foam">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-4">
              Verification and response
            </h2>
            <p className="font-sans text-foam/90 leading-relaxed max-w-4xl">
              For safety, we may need to verify your identity before processing certain requests. We aim to respond
              within a reasonable timeframe and will communicate if we need more information.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

