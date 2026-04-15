"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CustomCursor from "@/components/layout/CustomCursor";
import { cn } from "@/lib/cn";
import { ADMIN_NAV } from "@/lib/constants";

const ICONS: Record<string, string> = {
  BarChart3:       "▦",
  Users:           "⊕",
  GraduationCap:   "⊙",
  Settings:        "⚙",
  ScrollText:      "≡",
  LineChart:       "↗",
  Activity:        "◉",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen flex bg-[#F5F3EF]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-[#E8F2EE] w-60",
            "transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
            "lg:relative lg:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E8F2EE]">
            <span className="w-7 h-7 rounded-full bg-[#7BA89A] inline-block" />
            <div>
              <p className="font-serif text-lg text-[#3D5A54] leading-none">StillMind</p>
              <p className="font-sans text-[10px] text-[#3D5A54]/40 tracking-wider">Admin Console</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1 px-4 py-4">
            {ADMIN_NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 font-sans text-sm transition-all",
                    active
                      ? "bg-[#E8F2EE] text-[#3D5A54] font-medium"
                      : "text-[#3D5A54]/50 hover:bg-[#F5F3EF] hover:text-[#3D5A54]"
                  )}
                >
                  <span className="text-base">{ICONS[item.icon] ?? "○"}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#E8F2EE] p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C4D4E8] flex items-center justify-center">
                <span className="font-sans text-xs font-medium text-[#3D5A54]">A</span>
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-[#3D5A54]">System Admin</p>
                <p className="font-sans text-xs text-[#3D5A54]/40">admin@university.edu</p>
              </div>
            </div>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-20 bg-[#3D5A54]/20 lg:hidden" onClick={() => setOpen(false)} />}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#E8F2EE]">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-[#E8F2EE] cursor-none">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <line x1="0" y1="1" x2="18" y2="1" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="0" y1="6" x2="12" y2="6" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="0" y1="11" x2="18" y2="11" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="font-serif text-lg text-[#3D5A54]">Admin Console</span>
            <div className="w-8 h-8 rounded-full bg-[#C4D4E8] flex items-center justify-center">
              <span className="font-sans text-xs text-[#3D5A54]">A</span>
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
