"use client";

import Link from "next/link";
import Logo from "../brand/Logo";
import { usePathname } from "next/navigation";

type FooterLink = { label: string; href: string };

function withHomePrefix(pathname: string, href: string) {
  // Hash links should work from any route.
  if (!href.startsWith("#")) return href;
  return pathname === "/" ? href : `/${href}`;
}

export default function Footer() {
  const pathname = usePathname();

  const productLinks: FooterLink[] = [
    { label: "Product", href: "#experience" },
    { label: "Outcomes", href: "#outcomes" },
    { label: "Security", href: "/security" },
    { label: "Book a Demo", href: "/contact" },
  ];

  const companyLinks: FooterLink[] = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Sign In", href: "/login" },
  ];

  const trustLinks: FooterLink[] = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Notice", href: "/cookies" },
    { label: "Privacy Requests", href: "/privacy-requests" },
  ];

  return (
    <footer className="relative mt-0 bg-[#F0F0EE] overflow-hidden border-t border-teal/10">
      {/* Ambient background (full-bleed, not a card) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(123,168,154,0.16),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(33,76,70,0.08),transparent_50%)]" />
        <div className="absolute -top-24 right-[-5rem] h-80 w-80 rounded-full bg-sage/10 blur-[120px]" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-96 w-96 rounded-full bg-teal/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 pt-16 pb-10">
        {/* Top CTA band */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-10 border-b border-teal/10">
          <div className="max-w-2xl space-y-3">
            <p className="font-sans text-[11px] font-black uppercase tracking-[0.22em] text-teal/60">
              StillMind
            </p>
            <h3 className="font-serif text-2xl md:text-4xl leading-tight tracking-tight text-teal-dark">
              A calmer, clearer digital front door for campus mental-health support.
            </h3>
            <p className="font-sans text-sm md:text-base text-teal/75 leading-relaxed">
              Built for student dignity, counselor clarity, and institutional trust.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/contact"
              className="btn-primary !py-3.5 !px-7 !text-[11px] !font-black !uppercase !tracking-[0.2em]"
            >
              Book a Demo
            </Link>
            <Link
              href="/contact"
              className="btn-outline !py-3.5 !px-7 !text-[11px] !font-black !uppercase !tracking-[0.2em]"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pt-10">
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <Logo iconSize="md" />
            <p className="font-sans text-sm text-teal/70 leading-relaxed max-w-md">
              StillMind helps campuses guide students to support sooner — with privacy boundaries and role-based visibility designed to reduce unnecessary exposure of sensitive information.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">
              Product
            </p>
            <nav className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={withHomePrefix(pathname, link.href)}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors underline-reveal w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">
              Company
            </p>
            <nav className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors underline-reveal w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-sans text-xs font-black uppercase tracking-[0.2em] text-teal/75">
              Trust
            </p>
            <nav className="flex flex-col gap-2.5">
              {trustLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm text-teal/80 hover:text-teal-dark transition-colors underline-reveal w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-teal/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs font-black uppercase tracking-[0.15em] text-teal/65">
            2026 StillMind. All rights reserved.
          </p>
          <p className="font-sans text-xs font-black uppercase tracking-[0.12em] text-teal/65">
            Privacy-first · Human-centered care
          </p>
        </div>
      </div>
    </footer>
  );
}
