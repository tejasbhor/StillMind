"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CustomCursor from "@/components/layout/CustomCursor";
import { cn } from "@/lib/cn";
import { STUDENT_NAV } from "@/lib/constants";

// Icon map using inline SVG-like text glyphs for simplicity
const ICONS: Record<string, string> = {
  Home: "⌂",
  ClipboardList: "✎",
  Calendar: "◫",
  TrendingUp: "↗",
  MessageCircle: "◎",
  Bell: "◉",
};

// Mock student data — replace with real auth store
const STUDENT = { firstName: "Alex" };

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen flex bg-[#F5F3EF]">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-[#E8F2EE]",
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-56" : "w-16",
            "lg:w-56 lg:relative lg:translate-x-0",
            !sidebarOpen && "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-[#E8F2EE]">
            <span className="w-7 h-7 rounded-full bg-[#7BA89A] flex-shrink-0 inline-block" />
            <span className="font-serif text-lg text-[#3D5A54] whitespace-nowrap lg:block hidden">StillMind</span>
            <span className="font-serif text-lg text-[#3D5A54] whitespace-nowrap lg:hidden block opacity-100">StillMind</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1 px-3 py-5">
            {STUDENT_NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-sm transition-all duration-150",
                    active
                      ? "bg-[#E8F2EE] text-[#3D5A54] font-medium"
                      : "text-[#3D5A54]/50 hover:bg-[#F5F3EF] hover:text-[#3D5A54]"
                  )}
                >
                  <span className="text-base flex-shrink-0">{ICONS[item.icon]}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile footer */}
          <div className="border-t border-[#E8F2EE] p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B8D4C0] flex items-center justify-center flex-shrink-0">
                <span className="font-sans text-xs font-medium text-[#3D5A54]">
                  {STUDENT.firstName[0]}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-sm font-medium text-[#3D5A54] truncate">{STUDENT.firstName}</span>
                <span className="font-sans text-xs text-[#3D5A54]/40">Student</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-[#3D5A54]/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar (mobile) */}
          <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#E8F2EE]">
            <button
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#E8F2EE] transition-colors cursor-none"
            >
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <line x1="0" y1="1" x2="18" y2="1" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="0" y1="6" x2="12" y2="6" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="0" y1="11" x2="18" y2="11" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="font-serif text-lg text-[#3D5A54]">StillMind</span>
            <div className="w-8 h-8 rounded-full bg-[#B8D4C0] flex items-center justify-center">
              <span className="font-sans text-xs font-medium text-[#3D5A54]">{STUDENT.firstName[0]}</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
