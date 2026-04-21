import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";

export const metadata: Metadata = {
  title: "Cookie Notice | StillMind",
  description:
    "Learn how StillMind uses cookies and similar technologies to operate the site, improve performance, and understand usage.",
};

export default function CookieNoticePage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="min-h-screen pt-32 lg:pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <section className="rounded-3xl border border-teal/10 bg-white/75 backdrop-blur-xl shadow-soft p-7 md:p-10">
            <div className="flex flex-col gap-4">
              <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-teal/60">
                Cookie Notice
              </span>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight text-teal-dark">
                Cookies should support calm experiences — not surprise people.
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-teal/45">
                <span>Effective: April 18, 2026</span>
                <span className="w-1 h-1 rounded-full bg-teal/20" />
                <span>Version 1.0</span>
              </div>
              <p className="font-sans text-teal/80 leading-relaxed max-w-3xl">
                This notice explains how StillMind uses cookies and similar technologies on our website and services.
                For broader details about personal information, please see our Privacy Policy.
              </p>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <article className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">
                What are cookies?
              </h2>
              <p className="font-sans text-teal/80 leading-relaxed">
                Cookies are small text files stored on your device. Similar technologies (like local storage, pixels, or
                SDKs) may also be used to remember preferences, keep sessions secure, and understand how the site is
                used.
              </p>
            </article>

            <article className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">
                Why we use them
              </h2>
              <ul className="space-y-3">
                {[
                  "To keep the site working reliably and securely.",
                  "To remember settings that improve usability.",
                  "To understand usage patterns and improve performance.",
                  "To help prevent abuse and protect service integrity.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-teal/80">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-5">
              Cookie categories
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Essential",
                  text: "Required for core functionality, security, and session stability. These cannot usually be disabled without breaking key parts of the site.",
                },
                {
                  title: "Preferences",
                  text: "Remember choices that improve the experience (for example, interface preferences).",
                },
                {
                  title: "Analytics",
                  text: "Help us understand how pages are used so we can improve clarity and performance. Where required by law, we ask for consent before enabling non-essential analytics.",
                },
                {
                  title: "Third-party services",
                  text: "Some embedded or infrastructure services may set cookies or use similar technologies. We aim to keep this minimal and purpose-limited.",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-teal/10 bg-[#FAFAF8] p-6">
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.22em] text-teal/55">
                    {c.title}
                  </p>
                  <p className="mt-3 font-sans text-sm text-teal/80 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">
              Your choices
            </h2>
            <p className="font-sans text-teal/80 leading-relaxed max-w-4xl">
              You can usually control cookies through your browser settings (for example, blocking or deleting cookies).
              If your region requires consent for non-essential cookies, we will provide a consent experience where
              applicable.
            </p>
          </section>

          <section className="rounded-3xl border border-teal/10 bg-teal p-7 md:p-10 text-foam">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-4">
              Questions about cookies?
            </h2>
            <p className="font-sans text-foam/90 leading-relaxed max-w-4xl">
              Contact us at <span className="font-black">privacy@stillmind.com</span> for questions about cookies,
              analytics, or privacy choices.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

