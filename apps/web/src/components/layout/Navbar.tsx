"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MobileNav from "./MobileNav";
import MagneticButton from "../motion/MagneticButton";
import Logo from "../brand/Logo";
import { NAV_CONFIG, GLOBAL_NAV } from "@/utils/nav-config";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current page sections or default to Home
  const currentNavItems = NAV_CONFIG[pathname] || NAV_CONFIG["/"];
  const visibleItems = currentNavItems.slice(0, 3);
  const overflowItems = currentNavItems.slice(3);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Universal Frosted Glass Styles (Constant for all backgrounds)
  const navStyles = {
    container: "bg-white/75 backdrop-blur-2xl border border-white/40 shadow-card",
    text: "text-teal",
    textMuted: "text-teal/70 hover:text-teal",
    divider: "bg-teal/10",
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] px-4 lg:px-6 py-4 flex justify-center pointer-events-none"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className={`w-full max-w-[1440px] pointer-events-auto flex items-center justify-between gap-12 py-2 px-6 lg:px-10 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${navStyles.container}`}
      >
        <Logo 
          className="shrink-0 scale-90 lg:scale-100 origin-left" 
          iconSize="md" 
        />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {visibleItems.map((item) => {
            const isFallback = !NAV_CONFIG[pathname];
            const finalHref = item.href.startsWith("#") && isFallback ? `/${item.href}` : item.href;
            
            return (
              <Link
                key={item.label}
                href={finalHref}
                className={`font-sans text-xs font-bold uppercase tracking-[0.15em] transition-all underline-reveal whitespace-nowrap ${navStyles.textMuted}`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* More Dropdown */}
          {overflowItems.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-[0.15em] transition-all group ${navStyles.textMuted}`}
              >
                More <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 min-w-[200px] rounded-2xl p-2 border shadow-float bg-white border-teal/5"
                  >
                      {overflowItems.map((item) => {
                        const isFallback = !NAV_CONFIG[pathname];
                        const finalHref = item.href.startsWith("#") && isFallback ? `/${item.href}` : item.href;
                        
                        return (
                          <Link
                            key={item.label}
                            href={finalHref}
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-3 rounded-xl font-sans text-[11px] font-bold uppercase tracking-widest transition-all text-teal/70 hover:text-teal hover:bg-teal/5"
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Global Nav Elements */}
          <div className={`h-4 w-px mx-2 ${navStyles.divider}`} />
          {GLOBAL_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`font-sans text-xs font-bold uppercase tracking-[0.15em] transition-all underline-reveal ${
                pathname === item.href ? navStyles.text : navStyles.textMuted
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth & Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href="/login"
            className={`hidden sm:block font-sans text-xs font-bold uppercase tracking-widest transition-all underline-reveal ${navStyles.textMuted}`}
          >
            Sign In
          </Link>
          <MagneticButton>
            <Link
              href="/contact"
              className="!py-2.5 !px-8 !text-[11px] font-black uppercase tracking-widest shadow-md hover:shadow-float transition-all rounded-full bg-teal text-white hover:bg-teal-mid"
            >
              Demo
            </Link>
          </MagneticButton>
          
          <MobileNav 
            isOpen={mobileMenuOpen} 
            onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
        </div>
      </motion.div>
    </motion.header>
  );
}
