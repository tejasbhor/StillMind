import { Metadata } from "next";
import { Container, Section } from "@/components/ui/Grid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";

export const metadata: Metadata = {
  title: "Security | StillMind",
  description:
    "Plain-language overview of how StillMind approaches security, access controls, data handling, and responsible disclosure.",
};

export default function SecurityPage() {
  return (
    <div className="bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal-dark antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="min-h-screen pt-32 pb-24 lg:pt-40 lg:pb-32">
        <Container size="xl">
          <Section spacing="sm">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-teal-dark mb-6 tracking-tight">
              Security & Trust
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-teal/50 mb-12">
              <span>Last updated: April 18, 2026</span>
              <span className="hidden md:block w-1 h-1 rounded-full bg-teal/20" />
              <span>Version 1.1</span>
            </div>
            
            <p className="font-sans text-lg text-teal/80 leading-relaxed max-w-3xl mb-16">
              Protecting sensitive information is central to how StillMind is designed and operated. We use layered safeguards intended to support confidentiality, appropriate access, and service reliability.
            </p>
          </Section>

          <div className="space-y-24">
            {/* 01. Data Protection */}
            <Section id="protection" spacing="none" className="pt-12 border-t border-teal/5">
              <h2 className="font-serif text-3xl text-teal-dark mb-8 tracking-tight">1. How we approach security</h2>
              <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-6">
                  <p className="font-sans text-sm md:text-base text-teal/80 leading-relaxed">
                    We recognize that mental-health workflows involve sensitive context. StillMind is designed with privacy-conscious access boundaries and clear role-based visibility to reduce unnecessary exposure of personal information.
                  </p>
                  <p className="font-sans text-sm md:text-base text-teal/80 leading-relaxed">
                    We continuously improve safeguards as the product evolves, including access control, secure transport, operational monitoring, and accountability practices.
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-sage/[0.03] border border-teal/10">
                  <h4 className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/60 mb-4">Core Principles</h4>
                  <ul className="space-y-3">
                    {[
                      "Least necessary access",
                      "Privacy-conscious system design",
                      "Monitoring and accountability",
                      "Ongoing improvement"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 font-sans text-sm text-teal-dark font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* 02. Encryption */}
            <Section id="encryption" spacing="none" className="pt-12 border-t border-teal/5">
              <h2 className="font-serif text-3xl text-teal-dark mb-8 tracking-tight">2. Data handling and protection</h2>
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl text-teal-dark">In transit</h3>
                    <p className="font-sans text-sm text-teal/80 leading-relaxed">
                      Data moving between user devices and StillMind is protected in transit using modern encrypted transport protocols.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl text-teal-dark">System access</h3>
                    <p className="font-sans text-sm text-teal/80 leading-relaxed">
                      Internal system access is controlled and limited to authorized personnel with a legitimate operational need.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* 03. Access Control */}
            <Section id="access" spacing="none" className="pt-12 border-t border-teal/5">
              <h2 className="font-serif text-3xl text-teal-dark mb-8 tracking-tight">3. Role-based access and visibility</h2>
              <p className="font-sans text-sm md:text-base text-teal/80 leading-relaxed max-w-3xl mb-10">
                StillMind uses strict Role-Based Access Control (RBAC) to ensure that users only have access to the data necessary for their specific role.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    role: "Students",
                    permissions: "Can only access their own profile, messages, and appointments. Cannot see any counselor notes or institutional stats."
                  },
                  {
                    role: "Counselors",
                    permissions: "Can see assigned student details and clinical notes. Cannot see data for students not in their caseload without explicit transfer."
                  },
                  {
                    role: "Administrators",
                    permissions: "High-level visibility into institutional capacity and demand. No access to individual student clinical narratives or messages."
                  }
                ].map((item) => (
                  <div key={item.role} className="p-6 rounded-2xl border border-teal/10 flex flex-col gap-4">
                    <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-sage">{item.role}</span>
                    <p className="font-sans text-sm text-teal/80 leading-relaxed">{item.permissions}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 04. Monitoring and reliability */}
            <Section id="compliance" spacing="none" className="pt-12 border-t border-teal/5">
              <h2 className="font-serif text-3xl text-teal-dark mb-8 tracking-tight">4. Monitoring and reliability</h2>
              <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="font-serif text-xl text-teal-dark">Operational monitoring</h4>
                    <p className="font-sans text-sm text-teal/80 leading-relaxed">
                      We use monitoring and logging practices to support incident detection, service integrity, and accountability.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-serif text-xl text-teal-dark">Service resilience</h4>
                    <p className="font-sans text-sm text-teal/80 leading-relaxed">
                      We work to maintain reliability through infrastructure controls, operational review, and continuous improvement.
                    </p>
                  </div>
                </div>
                <div className="p-8 rounded-3xl bg-teal text-foam">
                  <h4 className="font-sans text-xs font-black uppercase tracking-[0.2em] text-sage mb-6">Security Infrastructure</h4>
                  <div className="space-y-6">
                    <div>
                      <span className="block font-serif text-lg mb-1">DDoS Mitigation</span>
                      <p className="text-sm text-foam/70">Traffic protection and filtering mechanisms are used to help preserve service availability.</p>
                    </div>
                    <div>
                      <span className="block font-serif text-lg mb-1">Review and hardening</span>
                      <p className="text-sm text-foam/70">Security controls are periodically reviewed and improved as product and infrastructure needs evolve.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 05. Responsible disclosure */}
            <Section id="infra" spacing="none" className="pt-12 border-t border-teal/5">
              <h2 className="font-serif text-3xl text-teal-dark mb-8 tracking-tight">5. Responsible disclosure</h2>
              <div className="prose prose-teal max-w-3xl">
                <p className="font-sans text-sm md:text-base text-teal/80 leading-relaxed">
                  If you believe you have identified a security issue, please report it to us directly. We review reports promptly and work in good faith to investigate and respond.
                </p>
              </div>
            </Section>

            {/* 06. Contact Section */}
            <Section id="contact" spacing="none" className="pt-24 border-t border-teal/10">
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="font-serif text-3xl text-teal-dark mb-4 tracking-tight">Security Concerns?</h2>
                  <p className="font-sans text-sm md:text-base text-teal/70 leading-relaxed max-w-xl">
                    For security questions or to report a concern, contact our security team.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-12 pt-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40">Email</span>
                    <a href="mailto:security@stillmind.com" className="font-sans text-sm font-medium text-teal-dark hover:text-sage transition-colors">
                      security@stillmind.com
                    </a>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-teal/40">Response Time</span>
                    <span className="font-sans text-sm text-teal-dark">
                      Critical reports are triaged within 24 hours.
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
