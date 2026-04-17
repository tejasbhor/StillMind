"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="font-serif text-3xl md:text-4xl text-[#3D5A54] mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate prose-sm md:prose-base max-w-none">
            <p className="font-sans text-[#3D5A54]/80 leading-relaxed mb-6">
              At StillMind, we believe your mental health information should stay private. This Privacy Policy explains how we collect, use, and protect your data.
            </p>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">What We Collect</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                We collect information you provide during check-ins, such as how you've been feeling and what support you need. We also collect basic account information like your name and email for authentication purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">How We Use Your Data</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                Your data is used to: match you with the right counsellor, prioritise your support needs fairly, and help your counsellor prepare for sessions. We never sell your data to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Data Protection</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                All your data is encrypted in transit and at rest. We follow industry best practices to keep your information secure. Access is strictly role-based — only authorised personnel can see what they need to help you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Your Rights</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                You can request to see, edit, or delete your data at any time. Contact your institution's administration or use the in-app contact feature to exercise these rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-serif text-xl text-[#3D5A54] mb-3">Contact Us</h2>
              <p className="font-sans text-[#3D5A54]/75 leading-relaxed">
                If you have questions about this policy, please contact us at privacy@stillmind.edu or through your institution's support channels.
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