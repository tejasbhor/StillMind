"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CONFIG, GLOBAL_NAV } from "@/utils/nav-config";

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileNav({ isOpen, onToggle }: MobileNavProps) {
  const pathname = usePathname();
  
  // Get current page sections or default to Home
  const currentNavItems = NAV_CONFIG[pathname] || NAV_CONFIG["/"];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 p-2 relative z-[101] outline-none group/burger"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        <span className={`w-6 h-0.5 bg-teal transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-2.5" : ""}`} />
        <span className={`w-6 h-0.5 bg-teal transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
        <span className={`w-6 h-0.5 bg-teal transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
      </button>

      {/* Mobile Menu Overlay */}
      <motion.div
        className="fixed inset-0 z-[90] lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-teal/20 backdrop-blur-md" 
          onClick={onToggle}
        />
        {/* Menu Panel */}
        <motion.div
          className="absolute top-24 left-6 right-6 bg-white rounded-3xl shadow-float border border-teal/10 overflow-hidden"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20, scale: isOpen ? 1 : 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
          <nav className="flex flex-col">
            <div className="p-3 bg-teal/[0.02] border-b border-teal/5">
               <span className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-teal/30">Sections</span>
            </div>
            
            {currentNavItems.map((item, i) => {
              const isFallback = !NAV_CONFIG[pathname];
              const finalHref = item.href.startsWith("#") && isFallback ? `/${item.href}` : item.href;
              
              return (
                <Link
                  key={item.label}
                  href={finalHref}
                  onClick={onToggle}
                  className="px-8 py-5 font-sans text-xs font-black uppercase tracking-widest text-teal/70 border-b border-teal/5 hover:bg-teal/5 transition-colors"
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="p-3 bg-teal/[0.02] border-b border-teal/5 mt-2">
               <span className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-teal/30">Platform</span>
            </div>

            {GLOBAL_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onToggle}
                className={`px-8 py-5 font-sans text-xs font-black uppercase tracking-widest border-b border-teal/5 hover:bg-teal/5 transition-colors ${
                  pathname === item.href ? "text-teal bg-teal/[0.02]" : "text-teal/70"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 p-6 bg-teal/[0.03]">
              <Link
                href="/login"
                onClick={onToggle}
                className="text-center py-4 font-sans text-[10px] font-black uppercase tracking-widest text-teal/60 hover:text-teal transition-colors rounded-xl border border-teal/10"
              >
                Sign In
              </Link>
              <Link
                href="/contact"
                onClick={onToggle}
                className="btn-primary text-center !py-4 !px-6 !text-[10px] !uppercase !tracking-[0.2em] !font-black !rounded-xl shadow-float shadow-teal/10"
              >
                Book a Demo
              </Link>
            </div>
          </nav>
        </motion.div>
      </motion.div>
    </>
  );
}
