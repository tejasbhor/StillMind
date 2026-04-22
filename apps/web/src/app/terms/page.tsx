"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import { Heading, Text } from "@/components/ui/Typography";
import { Container, Section } from "@/components/ui/Grid";
import { fadeUp, staggerContainer } from "@/utils/animations";

/**
 * StillMind Terms of Service
 * Strictly textual, legal-grade documentation.
 * Matches the institutional scale and responsiveness of the platform.
 */

export default function TermsPage() {
  return (
    <div className="relative bg-[#FCFCFA] selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_18%_18%,rgba(123,168,154,0.2),transparent_56%)]" />
        <div className="absolute right-0 top-[20rem] h-[36rem] w-[36rem] rounded-full bg-sage/10 blur-[120px]" />
        <div className="absolute left-[-8rem] top-[110rem] h-[30rem] w-[30rem] rounded-full bg-teal/10 blur-[140px]" />
      </div>
      <CustomCursor />
      <Navbar />

      <main className="relative min-h-screen pt-32 pb-24">
        <Container size="xl">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-12"
          >
            {/* ── Document Header ───────────────────────────────────────── */}
            <motion.header variants={fadeUp} className="space-y-4 border-b border-teal/5 pb-10">
              <Heading variant="h1" className="text-4xl lg:text-5xl font-serif text-teal-dark tracking-tight">
                Terms of Service
              </Heading>
              <div className="flex items-center gap-3 text-sage font-bold uppercase tracking-widest text-[10px]">
                <span>Effective Date: April 18, 2026</span>
                <span className="w-1 h-1 rounded-full bg-sage/30" />
                <span className="opacity-60">v1.2</span>
              </div>
              <Text variant="body" className="mt-6 text-teal/70 leading-relaxed italic max-w-3xl">
                These Terms of Service govern access to and use of the StillMind website, platform, and related services. By accessing or using StillMind, you agree to these Terms.
              </Text>
            </motion.header>

            {/* ── 1. Eligibility and authority ───────────────────────────── */}
            <Section id="eligibility" spacing="none" className="space-y-4 pt-4">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">1. Eligibility and authority</Heading>
              <Text variant="body">
                You may use the service only if you are legally able to enter into these Terms and, where applicable, authorized to act on behalf of an institution or organization.
              </Text>
            </Section>

            {/* ── 2. Accounts ────────────────────────────────────────────── */}
            <Section id="accounts" spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">2. Accounts</Heading>
              <Text variant="body">
                Users are responsible for maintaining the confidentiality of their credentials and for activities that occur under their accounts. You agree to provide accurate information and keep it current.
              </Text>
            </Section>

            {/* ── 3. Description of the service ───────────────────────────── */}
            <Section id="service" spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">3. Description of the service</Heading>
              <Text variant="body">
                StillMind provides software and related services intended to support campus mental-health coordination, access, workflows, and institutional visibility. Features may vary by user role, subscription, and implementation context.
              </Text>
            </Section>

            {/* ── 4. User roles and access ───────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">4. User roles and access</Heading>
              <Text variant="body">
                Access to features and data is role-dependent. Users may only access information and functionality made available to them through their assigned permissions. Attempting to access restricted areas or information is prohibited.
              </Text>
            </Section>

            {/* ── 5. Acceptable use ──────────────────────────────────────── */}
            <Section id="conduct" spacing="none" className="space-y-6 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">5. Acceptable use</Heading>
              <Text variant="body">You agree not to:</Text>
              <ul className="grid md:grid-cols-2 gap-x-12 gap-y-4 pl-4 border-l-2 border-sage/10 py-2">
                <li className="text-[15px] flex gap-3">
                  <span className="text-sage font-bold">→</span> 
                  <span>Misuse the service or attempt unauthorized access.</span>
                </li>
                <li className="text-[15px] flex gap-3">
                  <span className="text-sage font-bold">→</span> 
                  <span>Interfere with security, integrity, or availability.</span>
                </li>
                <li className="text-[15px] flex gap-3">
                  <span className="text-sage font-bold">→</span> 
                  <span>Upload malicious code or harmful content.</span>
                </li>
                <li className="text-[15px] flex gap-3">
                  <span className="text-sage font-bold">→</span> 
                  <span>Use the service in violation of law or institutional policy.</span>
                </li>
                <li className="text-[15px] flex gap-3">
                  <span className="text-sage font-bold">→</span> 
                  <span>Misrepresent identity or authority.</span>
                </li>
              </ul>
            </Section>

            {/* ── 6. Institutional use ───────────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">6. Institutional use</Heading>
              <Text variant="body">
                If you access StillMind through an institution, your use may also be subject to that institution’s policies, agreements, and implementation choices.
              </Text>
            </Section>

            {/* ── 7. Fees and billing ────────────────────────────────────── */}
            <Section id="billing" spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">7. Fees and billing</Heading>
              <Text variant="body">
                If StillMind is offered on a paid basis, subscription terms, billing cycles, renewals, fees, taxes, and payment obligations will be described in the applicable order form, subscription plan, or commercial agreement.
              </Text>
            </Section>

            {/* ── 8. Intellectual property ───────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">8. Intellectual property</Heading>
              <Text variant="body">
                StillMind and its related content, software, branding, design, and materials are owned by StillMind or its licensors and are protected by applicable intellectual property laws. These Terms do not grant ownership rights to users except for limited rights needed to use the service.
              </Text>
            </Section>

            {/* ── 9. Feedback ────────────────────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">9. Feedback</Heading>
              <Text variant="body">
                If you provide feedback, suggestions, or ideas, we may use them without restriction or compensation unless otherwise agreed in writing.
              </Text>
            </Section>

            {/* ── 10. Service changes and availability ───────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">10. Service changes and availability</Heading>
              <Text variant="body">
                We may modify, improve, suspend, or discontinue parts of the service from time to time. We do not guarantee uninterrupted or error-free availability.
              </Text>
            </Section>

            {/* ── 11. Suspension and termination ─────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">11. Suspension and termination</Heading>
              <Text variant="body">
                We may suspend or terminate access if these Terms are violated, if use creates risk to the service or others, or if required by law. Users may stop using the service at any time, subject to any contractual commitments.
              </Text>
            </Section>

            {/* ── 12. Important service notice ──────────────────────────── */}
            <Section id="emergency" spacing="none" className="pt-10 border-t border-teal/5">
              <div className="p-8 md:p-10 rounded-3xl border-2 border-teal/10 bg-sage/[0.02]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-dark text-white text-[9px] font-black uppercase tracking-widest">
                    Emergency Notice
                  </div>
                  <Heading variant="h2" className="text-2xl font-bold text-teal-dark">12. Important service notice</Heading>
                  <Text variant="body" className="text-teal-dark/90 leading-relaxed font-medium">
                    StillMind is a software and service platform. It <span className="font-black underline decoration-sage decoration-2 underline-offset-4 pointer-events-none">does not replace emergency services</span>, crisis response systems, or direct clinical judgment where such intervention is required.
                  </Text>
                  <Text variant="body" className="text-teal/70 italic">
                    In an emergency, users should contact appropriate emergency resources immediately.
                  </Text>
                </div>
              </div>
            </Section>

            {/* ── 13. Disclaimers ────────────────────────────────────────── */}
            <Section id="legal" spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">13. Disclaimers</Heading>
              <Text variant="body" className="italic opacity-80">
                To the maximum extent permitted by law, the service is provided on an “as is” and “as available” basis, without warranties of any kind unless expressly stated otherwise in a written agreement.
              </Text>
            </Section>

            {/* ── 14. Limitation of liability ────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">14. Limitation of liability</Heading>
              <Text variant="body">
                To the maximum extent permitted by law, StillMind and its affiliates will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenues, data, or goodwill arising from use of the service.
              </Text>
            </Section>

            {/* ── 15. Governing law ──────────────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">15. Governing law</Heading>
              <Text variant="body">
                These Terms are governed by the laws specified in the applicable contract or, if none is specified, the laws of [insert jurisdiction].
              </Text>
            </Section>

            {/* ── 16. Changes to these Terms ─────────────────────────────── */}
            <Section spacing="none" className="space-y-4 pt-10 border-t border-teal/5">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">16. Changes to these Terms</Heading>
              <Text variant="body">
                We may update these Terms from time to time. Continued use of the service after updated Terms become effective constitutes acceptance of the revised Terms.
              </Text>
            </Section>

            {/* ── 17. Contact ────────────────────────────────────────────── */}
            <Section id="contact" spacing="none" className="pt-10 border-t-2 border-sage/10">
              <div className="space-y-6">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">17. Contact</Heading>
                <Text variant="body">Questions about these Terms may be sent to:</Text>
                <div className="space-y-6 text-teal-dark">
                  <div className="grid md:grid-cols-[120px_1fr] gap-2 md:gap-8 items-baseline">
                    <Text variant="tiny" className="font-bold opacity-40 uppercase tracking-widest">Email</Text>
                    <Text variant="body" className="font-medium underline decoration-sage/30 underline-offset-4">legal@stillmind.com</Text>
                  </div>
                  <div className="grid md:grid-cols-[120px_1fr] gap-2 md:gap-8 items-baseline">
                    <Text variant="tiny" className="font-bold opacity-40 uppercase tracking-widest">Address</Text>
                    <Text variant="body" className="leading-relaxed">
                      StillMind Legal Team<br />
                      [Insert legal mailing address]
                    </Text>
                  </div>
                </div>
              </div>
            </Section>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
