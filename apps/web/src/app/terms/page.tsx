"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center px-6 md:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-[#E8F2EE]">
        <div className="flex-1 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="StillMind Logo" className="h-11 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:flex flex-[2] justify-center items-center gap-8">
          <Link href="/#features" className="font-sans text-sm font-medium text-[#3D5A54] hover:text-[#1C3530]">Features</Link>
          <Link href="/#how-it-works" className="font-sans text-sm font-medium text-[#3D5A54] hover:text-[#1C3530]">How it works</Link>
          <Link href="/#roles" className="font-sans text-sm font-medium text-[#3D5A54] hover:text-[#1C3530]">Roles</Link>
        </nav>
        <div className="flex-1 flex items-center justify-end gap-3">
          <Link href="/login" className="btn-ghost text-sm px-5 py-2">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2">
            Register
          </Link>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────────── */}
      <main className="min-h-screen pt-24 pb-16 px-6" style={{ background: "linear-gradient(160deg, #E8F2EE 0%, #F5F3EF 100%)" }}>
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-3xl md:text-4xl text-[#3D5A54] mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate prose-sm md:prose-base max-w-none">
            <p className="font-sans text-[#3D5A54]/80 leading-relaxed mb-6">
              Welcome to StillMind. By using our platform, you agree to these terms. Please read them carefully.
            </p>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Acceptable Use</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                StillMind is designed for legitimate mental health support purposes. You agree to use the platform in good faith, provide accurate information during check-ins, and treat all users with respect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Eligibility</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                StillMind is available to enrolled students, faculty, and staff at participating institutions. You must be affiliated with a partner institution to create an account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Your Responsibilities</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify your institution immediately if you suspect unauthorized access to your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Limitation of Liability</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                StillMind provides informational and triage support but is not a substitute for emergency care. If you are experiencing a mental health crisis, please contact emergency services or your institution's crisis hotline immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Intellectual Property</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                All content, design, and technology on StillMind is the property of StillMind and its partners. You may not copy, modify, or redistribute any part of the platform without our written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Changes to These Terms</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                We may update these terms occasionally. We will notify users of significant changes. Your continued use of StillMind after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Contact Us</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                For questions about these terms, please contact us at terms@stillmind.edu or through your institution's support channels.
              </p>
            </section>

            <p className="font-sans text-sm text-[#3D5A54]/50 mt-12">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8F2EE] px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StillMind Logo" className="h-10 w-auto" />
          </div>
          <p className="font-sans text-xs text-[#3D5A54]/50">
            A rule-based, explainable mental health triage platform · v1.0 · 2026
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A]">Privacy</Link>
            <Link href="/terms" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A]">Terms</Link>
            <Link href="/contact" className="font-sans text-xs text-[#3D5A54]/40 hover:text-[#7BA89A]">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}