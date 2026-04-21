import Logo from "@/components/brand/Logo";
import { Eye, ShieldCheck, Users } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F5F2]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(123,168,154,0.16),transparent_36%),radial-gradient(circle_at_75%_24%,rgba(33,76,70,0.08),transparent_34%),radial-gradient(circle_at_38%_92%,rgba(184,212,192,0.22),transparent_42%)]" />
      </div>

      <div className="relative min-h-screen flex">
        {/* Left panel — brand context */}
        <aside className="hidden lg:flex w-[47%] px-12 py-10 border-r border-teal/10 bg-[#f4f8f5]">
          <div className="flex h-full flex-col justify-between">
            <Logo iconSize="lg" className="-ml-2 mb-2" />

            <div className="space-y-5 max-w-md">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-teal/15 bg-white/70 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/55">
                <ShieldCheck className="h-3 w-3" />
                StillMind Access
              </p>
              <h2 className="font-serif text-[4rem] leading-[1.02] text-teal-dark tracking-tight">
                A calmer way to begin care.
              </h2>
              <p className="font-sans text-[1.08rem] leading-relaxed text-teal/75">
                Sign in to continue your journey, or create your student account to begin check-ins and guided support.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Privacy-first", sub: "Your data stays private and secure." },
                { icon: Users, title: "Human-in-the-loop", sub: "Real people behind every response." },
                { icon: Eye, title: "Role-based visibility", sub: "Right access for the right support." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-teal/10 bg-white/75">
                    <item.icon className="h-4 w-4 text-teal/70" />
                  </div>
                  <div>
                    <p className="font-sans text-[1rem] font-semibold text-teal-dark">{item.title}</p>
                    <p className="font-sans text-sm text-teal/65">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-teal/10 bg-white/75 p-5 max-w-sm">
              <p className="font-serif text-3xl text-sage leading-none">“</p>
              <p className="mt-1 font-sans text-base leading-relaxed text-teal/75">
                Empowering campuses to deliver earlier support, calmer experiences and stronger outcomes.
              </p>
            </div>

            <div className="border-t border-teal/10 pt-5">
              <p className="mb-3 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/50">Built on trust</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs font-bold uppercase tracking-[0.1em] text-teal/60">
                <span>HIPAA compliant</span>
                <span>ISO 27001 certified</span>
                <span>End-to-end encrypted</span>
                <span>GDPR ready</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right panel — auth form */}
        <section className="flex-1 flex items-center justify-center px-6 py-10 lg:py-14">
          <div className="w-full max-w-xl">
            <div className="lg:hidden mb-8">
              <Logo iconSize="md" />
            </div>
            <div className="rounded-[2rem] border border-teal/10 bg-white/90 backdrop-blur-xl shadow-[0_16px_50px_rgba(61,90,84,0.12)] p-6 md:p-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

