import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | StillMind",
  description:
    "Why StillMind exists and how we support students, counselors, and institutions with privacy-first, human-centered design.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="pt-28 lg:pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto w-full">
          <section className="rounded-[2rem] border border-teal/10 bg-white/75 backdrop-blur-xl shadow-soft px-6 md:px-10 py-10 md:py-14">
            <div className="max-w-4xl space-y-6">
              <span className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-teal/60">
                About StillMind
              </span>
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.02] tracking-tight text-teal-dark">
                StillMind exists to help campuses respond sooner, more clearly, and more compassionately when students need support.
              </h1>
              <p className="font-sans text-base md:text-lg text-teal/80 leading-relaxed">
                StillMind is a campus mental-health support product designed to improve how students are guided to care, how counselors focus their time, and how institutions understand demand without losing sight of dignity and privacy.
              </p>
            </div>
          </section>

          <section className="mt-10 grid lg:grid-cols-2 gap-6">
            <article id="mission" className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">Our mission</h2>
              <p className="font-sans text-teal/80 leading-relaxed">
                We believe no student should have to sit in uncertainty when asking for help. StillMind is built to make the first step toward support feel clearer, calmer, and easier to trust.
              </p>
            </article>

            <article id="problem" className="rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
              <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">The problem</h2>
              <p className="font-sans text-teal/80 leading-relaxed">
                Across many institutions, demand for mental-health support is rising while counseling capacity remains limited. That creates long waits, uneven prioritization, and too much strain on the people responsible for care.
              </p>
            </article>
          </section>

          <section className="mt-6 rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-4">What StillMind does</h2>
            <p className="font-sans text-teal/80 leading-relaxed max-w-4xl">
              StillMind helps institutions guide students toward support more effectively, helps counselors focus where support is most needed, and gives campus teams clearer visibility into service delivery. The product is designed around privacy, fairness, and calm user experience.
            </p>
          </section>

          <section id="who-we-serve" className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Students",
                text: "Students who need a clearer first step toward support.",
              },
              {
                title: "Counselors",
                text: "Counselors who need better prioritization and less operational friction.",
              },
              {
                title: "Institutions",
                text: "Institutions that need confidence, structure, and privacy-conscious oversight.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-teal/10 bg-white p-6"
              >
                <h3 className="font-serif text-2xl text-teal-dark tracking-tight mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-teal/80 leading-relaxed">{item.text}</p>
              </article>
            ))}
          </section>

          <section id="principles" className="mt-6 rounded-3xl border border-teal/10 bg-white p-7 md:p-9">
            <h2 className="font-serif text-3xl text-teal-dark tracking-tight mb-5">Our principles</h2>
            <ul className="grid md:grid-cols-2 gap-x-10 gap-y-3">
              {[
                "Student dignity comes first.",
                "Human care stays central.",
                "Privacy should be built in, not added later.",
                "Systems should help people act with clarity, not add confusion.",
              ].map((principle) => (
                <li key={principle} className="flex items-start gap-3 font-sans text-teal/80">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sage shrink-0" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-3xl border border-teal/10 bg-teal p-7 md:p-10 text-foam">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-4">
              Why it matters
            </h2>
            <p className="font-sans text-foam/90 leading-relaxed max-w-4xl">
              StillMind is designed for a future where campus mental-health access feels more responsive, more thoughtful, and more humane for everyone involved.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary !bg-white !text-teal !font-black">
                Book a Demo
              </Link>
              <Link href="/contact" className="btn-outline !border-white/30 !text-white hover:!bg-white/10">
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
