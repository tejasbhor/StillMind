"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import { Heading, Text } from "@/components/ui/Typography";
import { Container, Section } from "@/components/ui/Grid";
import { fadeUp, staggerContainer } from "@/utils/animations";

/**
 * StillMind Privacy Policy
 * Purely textual, legal-grade documentation.
 * Focuses on clarity, structure, and institutional trust.
 */

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white selection:bg-teal/5 overflow-x-hidden text-teal antialiased font-sans">
      <CustomCursor />
      <Navbar />

      <main className="relative pt-32 pb-24">
        <Container size="6xl">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-12"
          >
            {/* ── Document Header ───────────────────────────────────────── */}
            <motion.header variants={fadeUp} className="space-y-4 border-b border-teal/5 pb-10">
              <Heading variant="h1" className="text-4xl lg:text-5xl font-serif text-teal-dark tracking-tight">
                Privacy Policy
              </Heading>
              <div className="flex items-center gap-3 text-sage font-bold uppercase tracking-widest text-[10px]">
                <span>Effective Date: April 18, 2026</span>
                <span className="w-1 h-1 rounded-full bg-sage/30" />
                <span className="opacity-60">v1.3</span>
              </div>
              <Text variant="body" className="mt-6 text-teal/70 leading-relaxed italic">
                StillMind is committed to protecting personal information and handling it responsibly. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to users and institutional customers.
              </Text>
            </motion.header>

            {/* ── 1. Information We Collect ─────────────────────────────── */}
            <Section id="collection" spacing="none" className="space-y-6 pt-6">
              <Heading variant="h2" className="text-2xl font-bold text-teal-dark">1. Information we collect</Heading>
              <Text variant="body">We may collect:</Text>
              <ul className="space-y-4 list-none pl-4 border-l-2 border-sage/10">
                <li className="space-y-1">
                  <Text variant="small" className="font-black text-teal-dark uppercase tracking-widest text-[9px]">Account Information</Text>
                  <Text variant="body">Name, email address, institutional affiliation, role, and login credentials.</Text>
                </li>
                <li className="space-y-1">
                  <Text variant="small" className="font-black text-teal-dark uppercase tracking-widest text-[9px]">Profile Information</Text>
                  <Text variant="body">Contact details and other information users choose to provide.</Text>
                </li>
                <li className="space-y-1">
                  <Text variant="small" className="font-black text-teal-dark uppercase tracking-widest text-[9px]">Service Data</Text>
                  <Text variant="body">Check-ins, scheduling actions, support-related records, and other data needed to provide the StillMind service.</Text>
                </li>
                <li className="space-y-1">
                  <Text variant="small" className="font-black text-teal-dark uppercase tracking-widest text-[9px]">Technical Usage</Text>
                  <Text variant="body">IP address, browser type, device information, pages visited, timestamps, and product interactions.</Text>
                </li>
                <li className="space-y-1">
                  <Text variant="small" className="font-black text-teal-dark uppercase tracking-widest text-[9px]">Cookies</Text>
                  <Text variant="body">Used for product functionality, analytics, and site performance.</Text>
                </li>
              </ul>

              <div className="pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">2. How we collect information</Heading>
                <Text variant="body">
                  We collect information directly from users, from institutional customers that make StillMind available to their communities, and automatically through use of our website and services.
                </Text>
              </div>
            </Section>

            {/* ── 2. How We Use Information ─────────────────────────────── */}
            <Section id="usage" spacing="none" className="space-y-8 pt-8 border-t border-teal/5">
              <div className="space-y-4">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">3. How we use information</Heading>
                <Text variant="body">We use personal information to:</Text>
                <ul className="grid md:grid-cols-2 gap-x-12 gap-y-3 pl-4">
                  <li className="text-[15px]">• Provide, operate, and maintain StillMind</li>
                  <li className="text-[15px]">• Authenticate users and manage access</li>
                  <li className="text-[15px]">• Support scheduling and communication</li>
                  <li className="text-[15px]">• Improve product reliability and user experience</li>
                  <li className="text-[15px]">• Maintain security and prevent misuse</li>
                  <li className="text-[15px]">• Meet legal and contractual obligations</li>
                </ul>
              </div>

              <div className="space-y-4 pt-8 border-t border-teal/5">
                <div className="p-8 rounded-3xl bg-sage/[0.03] border border-sage/10">
                  <Heading variant="h2" className="text-2xl font-bold text-teal-dark mb-4">4. Sensitive information</Heading>
                  <Text variant="body">
                    Because StillMind supports mental-health-related workflows, some information processed through the service may be sensitive. We handle such information with heightened care and restrict access based on role, need, and applicable obligations.
                  </Text>
                </div>
              </div>
            </Section>

            {/* ── 3. Access & Sharing ───────────────────────────────────── */}
            <Section id="access" spacing="none" className="space-y-8 pt-8 border-t border-teal/5">
              <div className="space-y-4">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">5. How we share information</Heading>
                <Text variant="body" className="font-medium text-teal-dark">We do not sell personal information.</Text>
                <Text variant="body">We may share information:</Text>
                <ul className="space-y-3 pl-4 list-disc marker:text-sage/40">
                  <li>With service providers who support hosting, authentication, communications, analytics, or infrastructure.</li>
                  <li>With institutional customers as needed to provide contracted services and only within appropriate role and access boundaries.</li>
                  <li>When required by law, legal process, or valid governmental request.</li>
                  <li>To protect rights, safety, security, or the integrity of the service.</li>
                </ul>
              </div>

              <div className="space-y-4 pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">6. Role-based visibility</Heading>
                <Text variant="body" className="leading-relaxed">
                  StillMind is designed so that different users see different categories of information based on role and need. Students receive user-safe views, counselors access information needed for care delivery within their scope, and administrators receive limited operational visibility rather than unrestricted access to sensitive records.
                </Text>
              </div>
            </Section>

            {/* ── 4. Security & Retention ───────────────────────────────── */}
            <Section id="security" spacing="none" className="space-y-8 pt-8 border-t border-teal/5">
              <div className="space-y-4">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">7. Data retention</Heading>
                <Text variant="body">
                  We retain personal information for as long as necessary to provide the service, meet contractual and legal obligations, maintain security and audit records, resolve disputes, and enforce our agreements.
                </Text>
              </div>

              <div className="space-y-4 pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">8. Security</Heading>
                <Text variant="body">
                  We use administrative, technical, and organizational measures designed to protect personal information, including access controls, encryption in transit, restricted permissions, and monitoring practices appropriate to the nature of the service.
                </Text>
              </div>
            </Section>

            {/* ── 5. Rights & Eligibility ───────────────────────────────── */}
            <Section id="rights" spacing="none" className="space-y-8 pt-8 border-t border-teal/5">
              <div className="space-y-4 pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">9. Cookies and analytics</Heading>
                <Text variant="body">
                  We may use cookies and similar technologies to operate the website, remember preferences, analyze usage, and improve performance. Where required by law, we ask for consent before enabling non-essential cookies.
                </Text>
              </div>

              <div className="space-y-4 pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">10. Your rights and choices</Heading>
                <Text variant="body">
                  Depending on your location and relationship with StillMind, you may have rights to access, correct, delete, restrict, object to, or request a copy of certain personal information.
                </Text>
              </div>

              <div className="space-y-4 pt-8 border-t border-teal/5">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">11. Children and eligibility</Heading>
                <Text variant="body">
                  StillMind is intended for use only by individuals or institutions authorized to use the service. Additional institutional or legal requirements may apply depending on the setting in which the service is deployed.
                </Text>
              </div>
            </Section>

            {/* ── 6. Contact & Cookies ──────────────────────────────────── */}
            <Section id="contact" spacing="none" className="space-y-12 pt-8 border-t border-teal/5">
              <div className="space-y-4">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">12. Changes to this policy</Heading>
                <Text variant="body">
                  We may update this Privacy Policy from time to time. When we do, we will update the effective date and take appropriate steps to communicate material changes.
                </Text>
              </div>

              <div className="space-y-6 pt-10 border-t-2 border-sage/10">
                <Heading variant="h2" className="text-2xl font-bold text-teal-dark">13. Contact us</Heading>
                <Text variant="body">If you have questions about this Privacy Policy or our privacy practices, contact us at:</Text>
                <div className="space-y-4 text-teal-dark">
                  <div>
                    <Text variant="tiny" className="font-bold opacity-40 uppercase tracking-widest mb-1">Email</Text>
                    <Text variant="body" className="font-medium underline decoration-sage/30 underline-offset-4">privacy@stillmind.com</Text>
                  </div>
                  <div>
                    <Text variant="tiny" className="font-bold opacity-40 uppercase tracking-widest mb-1">Address</Text>
                    <Text variant="body" className="leading-relaxed">
                      StillMind Privacy Team<br />
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
