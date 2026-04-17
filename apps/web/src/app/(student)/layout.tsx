"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import Logo from "@/components/brand/Logo";
import { STUDENT_NAV } from "@/utils/constants";
import { useAuthStore } from "@/hooks/auth-store";
import { studentApi } from "@/services/api";

const ICONS: Record<string, string> = {
  Home: "⌂",
  ClipboardList: "✎",
  Calendar: "◫",
  TrendingUp: "↗",
  MessageCircle: "◎",
  Bell: "◉",
};

interface StudentProfile {
  full_name: string | null;
  phone: string | null;
  email?: string;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await studentApi.getProfile();
        const data = res?.data || res;
        setProfile(data);
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
    loadProfile();
  }, []);

  const userDisplayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const userRole = user?.role || "student";
  const avatarInitial = userDisplayName[0]?.toUpperCase() || "U";
  const userEmail = user?.email || "";

  return (
    <>
      <div className="min-h-screen flex bg-[#F5F3EF]">

        {/* ── Sidebar ────────────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-[#E8F2EE] w-64",
            "transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            "lg:relative lg:translate-x-0"
          )}
        >
          <div className="px-6 py-6 border-b border-[#E8F2EE]">
            <Logo iconSize="md" />
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1 px-4 py-5">
            {STUDENT_NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
                  <span className="text-base">{ICONS[item.icon]}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-[#3D5A54]/20 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── Main content ────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          {/* Global Header */}
          <header className="flex items-center justify-between lg:justify-end px-5 py-4 bg-white border-b border-[#E8F2EE]">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[#E8F2EE] cursor-pointer">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <line x1="0" y1="1" x2="18" y2="1" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="6" x2="12" y2="6" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="11" x2="18" y2="11" stroke="#3D5A54" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <span className="font-serif text-lg text-[#3D5A54]">Student Portal</span>
            </div>
            
            {/* Desktop / Global Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-[#F5F3EF] rounded-full p-1 lg:pr-3 transition-colors border border-transparent hover:border-[#E8F2EE]"
              >
                <div className="w-8 h-8 rounded-full bg-[#B8D4C0] flex items-center justify-center">
                  <span className="font-sans text-xs font-medium text-[#3D5A54]">{avatarInitial}</span>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                    <span className="font-sans text-sm font-medium text-[#3D5A54]">{userDisplayName}</span>
                    <span className="text-[#3D5A54]/50 text-xs">▼</span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E8F2EE] py-1 z-50 overflow-hidden animate-fade-up" style={{ animationDuration: '0.2s' }}>
                  <div className="px-4 py-2 border-b border-[#E8F2EE]">
                    <p className="font-sans text-sm font-medium text-[#3D5A54]">{userDisplayName}</p>
                    <p className="font-sans text-xs text-[#3D5A54]/60 truncate">{userEmail}</p>
                  </div>
                  <Link href="/dashboard/profile" className="block px-4 py-2 font-sans text-sm text-[#3D5A54] hover:bg-[#F5F3EF]" onClick={() => setProfileOpen(false)}>
                    Edit Profile
                  </Link>
                  <Link href="/dashboard/notifications-settings" className="block px-4 py-2 font-sans text-sm text-[#3D5A54] hover:bg-[#F5F3EF]" onClick={() => setProfileOpen(false)}>
                    Notification Settings
                  </Link>
                  <hr className="my-1 border-[#E8F2EE]" />
                  <button onClick={() => { logout(); window.location.href = "/login"; }} className="w-full text-left px-4 py-2 font-sans text-sm text-[#B03030] hover:bg-[#FDEAEA]">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
