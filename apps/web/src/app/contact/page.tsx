"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
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

        {/* ── Success Message ─────────────────────────────────────────────────── */}
        <main className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #E8F2EE 0%, #F5F3EF 100%)" }}>
          <div className="mx-auto max-w-md text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "radial-gradient(circle, #B8D4C0, #7BA89A)" }}>
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="font-serif text-2xl text-[#3D5A54] mb-4">Message Sent</h1>
            <p className="font-sans text-[#3D5A54]/75 mb-8">
              Thank you for reaching out. We'll get back to you as soon as possible, usually within 24-48 hours.
            </p>
            <Link href="/" className="btn-primary text-sm px-6 py-2.5">
              Back to Home
            </Link>
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
        <div className="mx-auto max-w-2xl">
          <h1 className="font-serif text-3xl md:text-4xl text-[#3D5A54] mb-4 text-center">Contact Us</h1>
          <p className="font-sans text-[#3D5A54]/75 mb-10 text-center">
            Have questions? We'd love to hear from you.
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8F2EE] p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-sans text-sm font-medium text-[#3D5A54]">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="px-4 py-2.5 rounded-lg border border-[#B8D4C0] font-sans text-sm text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
                placeholder="Enter your name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-sans text-sm font-medium text-[#3D5A54]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="px-4 py-2.5 rounded-lg border border-[#B8D4C0] font-sans text-sm text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="font-sans text-sm font-medium text-[#3D5A54]">
                Subject
              </label>
              <select
                id="subject"
                required
                className="px-4 py-2.5 rounded-lg border border-[#B8D4C0] font-sans text-sm text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A] bg-white"
              >
                <option value="">Select a topic</option>
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-sans text-sm font-medium text-[#3D5A54]">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                className="px-4 py-2.5 rounded-lg border border-[#B8D4C0] font-sans text-sm text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A] resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button type="submit" className="btn-primary text-sm px-6 py-2.5 mt-2">
              Send Message
            </button>
          </form>

          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E8F2EE] p-6">
              <h3 className="font-serif text-base text-[#3D5A54] mb-2">For Students</h3>
              <p className="font-sans text-sm text-[#3D5A54]/75 mb-3">
                Contact your institution's counseling center for immediate support.
              </p>
              <p className="font-sans text-sm text-[#7BA89A]">
                Available 24/7 for crises
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E8F2EE] p-6">
              <h3 className="font-serif text-base text-[#3D5A54] mb-2">For Institutions</h3>
              <p className="font-sans text-sm text-[#3D5A54]/75 mb-3">
                Interested in bringing StillMind to your campus?
              </p>
              <p className="font-sans text-sm text-[#7BA89A]">
                partnerships@stillmind.edu
              </p>
            </div>
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