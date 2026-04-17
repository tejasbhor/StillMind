"use client";

import Link from "next/link";
import Logo from "../brand/Logo";

export default function Footer() {
  return (
    <footer className="py-12 px-8 border-t border-teal/[0.12] bg-[#F0F0EE]">
      <div className="max-w-6xl mx-auto w-full">
        {/* Main footer grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Column 1 - Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo iconSize="md" />

            <p className="font-sans text-sm text-teal/70 leading-relaxed">
              A calmer, clearer way to deliver campus mental-health support.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">Product</span>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Product", href: "#experience" },
                { label: "For Students", href: "#outcomes" },
                { label: "For Counselors", href: "#outcomes" },
                { label: "Book a Demo", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 - Company */}
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">Company</span>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Sign In", href: "/login" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 - Trust */}
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">Trust</span>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Security", href: "/security" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-teal/[0.1] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs font-black uppercase tracking-[0.15em] text-teal/75">
            2026 StillMind
          </p>
          <p className="font-sans text-xs font-black uppercase tracking-[0.12em] text-teal/75">
            Privacy-first · Human-centered care
          </p>
        </div>
      </div>
    </footer>
  );
}
