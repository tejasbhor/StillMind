"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen flex bg-[#F5F3EF]">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-[#E8F2EE]",
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-56" : "w-16",
            "lg:w-56 lg:relative lg:translate-x-0",
            !sidebarOpen && "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-[#E8F2EE] overflow-hidden whitespace-nowrap">
            <img src="/logo.png" alt="StillMind Logo" className="h-[44px] w-auto max-w-none mix-blend-multiply flex-shrink-0" />
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
                      : "text-[#4A5E5A] font-normal hover:bg-[#F5F3EF] hover:text-[#3D5A54]"
                  )}
                >
                  <span className="text-base flex-shrink-0">{ICONS[item.icon]}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#3D5A54]/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="flex items-center justify-between lg:justify-end px-5 py-4 bg-white border-b border-[#E8F2EE]">
            {/* Mobile Title & Menu */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-[#E8F2EE] transition-colors cursor-pointer"
              >
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <line x1="0" y1="1" x2="18" y2="1" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="12" y2="6" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="11" x2="18" y2="11" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <span className="font-serif text-lg text-[#3D5A54]">StillMind</span>
            </div>

            {/* Desktop / Global Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-[#F5F3EF] rounded-full p-1 lg:pr-3 transition-colors border border-transparent hover:border-[#E8F2EE]"
              >
                <div className="w-8 h-8 rounded-full bg-[#B8D4C0] flex items-center justify-center">
                  <span className="font-sans text-xs font-medium text-[#3D5A54]">{STUDENT.firstName[0]}</span>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="font-sans text-sm font-medium text-[#3D5A54]">{STUDENT.firstName}</span>
                    <span className="text-[#3D5A54]/50 text-xs">▼</span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E8F2EE] py-1 z-50 overflow-hidden animate-fade-up" style={{ animationDuration: '0.2s' }}>
                  <Link href="#" className="block px-4 py-2 font-sans text-sm text-[#3D5A54] hover:bg-[#F5F3EF]">Edit Profile</Link>
                  <Link href="#" className="block px-4 py-2 font-sans text-sm text-[#3D5A54] hover:bg-[#F5F3EF]">Notification Settings</Link>
                  <hr className="my-1 border-[#E8F2EE]" />
                  <Link href="/login" className="block px-4 py-2 font-sans text-sm text-[#B03030] hover:bg-[#FDEAEA]">Log out</Link>
                </div>
              )}
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
