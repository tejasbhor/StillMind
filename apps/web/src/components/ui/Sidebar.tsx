"use client";

import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "stillmind.sidebar.expanded";

/**
 * StillMind shell sidebar — ChatGPT-style rail (collapsed) / panel (expanded).
 * Theme: StillMind tokens (paper, teal) — not the reference app’s dark chrome.
 */

interface SidebarContextProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}

export const SIDEBAR_WIDTH_EXPANDED = 300;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  // Always default to true for the initial render to match SSR
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Sync with localStorage and Check Mobile on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const mobile = window.innerWidth < 1024;
    
    setIsMobile(mobile);
    
    if (mobile) {
      setExpanded(false);
    } else if (stored !== null) {
      setExpanded(stored === "true");
    }
    
    setHasHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem(STORAGE_KEY, String(expanded));
    }
  }, [expanded, hasHydrated]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    };
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => setExpanded((e) => !e);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle, isMobile }}>
      <div className="h-screen min-h-0 overflow-x-hidden bg-[#F5F7F6]">{children}</div>
    </SidebarContext.Provider>
  );
};

function MobileNavBackdrop() {
  const { expanded, setExpanded, isMobile } = useSidebar();
  if (!isMobile || !expanded) return null;
  return (
    <button
      type="button"
      aria-label="Close menu"
      className="fixed inset-0 z-[35] bg-teal-dark/25 backdrop-blur-sm lg:hidden"
      onClick={() => setExpanded(false)}
    />
  );
}

export const Sidebar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { expanded, isMobile } = useSidebar();

  const widthPx = isMobile
    ? expanded
      ? SIDEBAR_WIDTH_EXPANDED
      : 0
    : expanded
      ? SIDEBAR_WIDTH_EXPANDED
      : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <>
      <MobileNavBackdrop />
      <motion.aside
        initial={false}
        animate={{
          width: widthPx,
          opacity: isMobile && !expanded ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        style={{ overflow: "hidden" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col shrink-0 max-w-[min(100vw,300px)]",
          "border-r border-teal/10 bg-white/85 backdrop-blur-2xl shadow-[2px_0_24px_-12px_rgba(61,90,84,0.12)]",
          isMobile && !expanded && "pointer-events-none border-0",
          className
        )}
      >
        {children}
      </motion.aside>
    </>
  );
};

export const SidebarHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { expanded } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-[4.25rem] items-center gap-2 border-b border-teal/8 px-3",
        expanded ? "justify-between" : "justify-center px-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "mt-auto border-t border-teal/8 bg-white/60 p-2 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
};

/** Section label — only visible when sidebar expanded */
export const SidebarSectionLabel = ({ label }: { label: string }) => {
  const { expanded } = useSidebar();
  if (!expanded) return null;
  return (
    <p className="mb-1.5 mt-4 first:mt-0 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-teal/45">
      {label}
    </p>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

export const SidebarItem = ({ icon, label, active, href, onClick, badge }: SidebarItemProps) => {
  const { expanded } = useSidebar();

  const content = (
    <>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center",
          active ? "text-white" : "text-teal-muted/80 group-hover:text-teal"
        )}
      >
        {icon}
      </div>

      <AnimatePresence mode="wait">
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="min-w-0 flex-1 truncate text-left"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {badge !== undefined && badge !== "" && Number(badge) > 0 && expanded && (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
            active ? "bg-white/25 text-white" : "bg-[#FDEAEA] text-[#B03030]"
          )}
        >
          {Number(badge) > 99 ? "99+" : badge}
        </span>
      )}

      {!expanded && (
        <span className="sr-only">{label}</span>
      )}

      {!expanded && (
        <div className="pointer-events-none absolute left-full z-[60] ml-3 rounded-lg border border-teal/10 bg-white px-2.5 py-1.5 font-sans text-xs font-medium text-teal-dark shadow-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap">
          {label}
          {badge !== undefined && Number(badge) > 0 ? ` (${badge})` : ""}
        </div>
      )}
    </>
  );

  const baseClassName = cn(
    "group relative flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    active
      ? "bg-teal text-white shadow-soft"
      : "text-teal-muted/80 hover:bg-teal/[0.07] hover:text-teal-dark",
    !expanded && "justify-center px-2"
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClassName}>
      {content}
    </button>
  );
};

/** Top-of-sidebar primary control: expand / collapse (ChatGPT-style) */
export function SidebarRailToggle() {
  const { expanded, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-white/90 text-teal transition-colors",
        "hover:bg-foam hover:border-teal/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2"
      )}
      aria-expanded={expanded}
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      title={expanded ? "Collapse" : "Expand"}
    >
      {expanded ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
    </button>
  );
}
