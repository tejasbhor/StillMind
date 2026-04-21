/**
 * Portal navigation — grouped sections for AppShell (student / counselor / admin).
 * Labels align with product docs; routes match existing app pages.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  MessageCircle,
  Bell,
  ListOrdered,
  BarChart3,
  Users,
  GraduationCap,
  Settings,
  ScrollText,
  LineChart,
  Activity,
  UserRound,
  Home,
  SlidersHorizontal,
} from "lucide-react";

export type PortalNavIconKey =
  | "Home"
  | "ClipboardList"
  | "Calendar"
  | "CalendarDays"
  | "TrendingUp"
  | "MessageCircle"
  | "Bell"
  | "LayoutDashboard"
  | "ListOrdered"
  | "BarChart3"
  | "Users"
  | "GraduationCap"
  | "Settings"
  | "ScrollText"
  | "LineChart"
  | "Activity"
  | "UserRound"
  | "SlidersHorizontal";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: PortalNavIconKey;
  /** Search keywords (not shown) — optional extra matches */
  keywords?: string[];
}

export interface PortalNavSection {
  id: string;
  label: string;
  items: readonly PortalNavItem[];
}

export const PORTAL_NAV_ICONS: Record<PortalNavIconKey, LucideIcon> = {
  Home,
  ClipboardList,
  Calendar: CalendarDays,
  CalendarDays,
  TrendingUp,
  MessageCircle,
  Bell,
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Users,
  GraduationCap,
  Settings,
  ScrollText,
  LineChart,
  Activity,
  UserRound,
  SlidersHorizontal,
};

/** Portal kind — used by AppShell header actions (search, alerts, chat). */
export type PortalKind = "student" | "counselor" | "admin";

/** Student — care + account. Messages and alerts live in the top header only. */
export const STUDENT_NAV_SECTIONS: readonly PortalNavSection[] = [
  {
    id: "journey",
    label: "Your care",
    items: [
      { href: "/dashboard", label: "Home", icon: "Home", keywords: ["dashboard"] },
      {
        href: "/dashboard/assessment",
        label: "Check-in",
        icon: "ClipboardList",
        keywords: ["assessment", "phq", "gad"],
      },
      { href: "/dashboard/appointments", label: "Appointments", icon: "Calendar", keywords: ["sessions", "slots"] },
      { href: "/dashboard/progress", label: "Progress", icon: "TrendingUp", keywords: ["history", "trend"] },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: "UserRound", keywords: ["settings", "you"] },
      {
        href: "/dashboard/notifications-settings",
        label: "Notification preferences",
        icon: "SlidersHorizontal",
        keywords: ["email", "preferences"],
      },
    ],
  },
] as const;

/** Counselor — workload only in sidebar; messages open from the header. */
export const COUNSELOR_NAV_SECTIONS: readonly PortalNavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        href: "/counselor",
        label: "Dashboard",
        icon: "LayoutDashboard",
        keywords: ["home", "summary", "alerts"],
      },
      {
        href: "/counselor/priority-queue",
        label: "Priority queue",
        icon: "ListOrdered",
        keywords: ["triage", "queue", "risk"],
      },
      {
        href: "/counselor/schedule",
        label: "Schedule",
        icon: "CalendarDays",
        keywords: ["today", "sessions", "calendar"],
      },
    ],
  },
] as const;

/** Admin — governance + operations (Admin System Design) */
export const ADMIN_NAV_SECTIONS: readonly PortalNavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin", label: "System overview", icon: "BarChart3", keywords: ["dashboard", "metrics"] },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { href: "/admin/counselors", label: "Counselors", icon: "Users", keywords: ["staff", "capacity"] },
      { href: "/admin/students", label: "Students", icon: "GraduationCap", keywords: ["roster", "limited"] },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      { href: "/admin/config", label: "Configuration", icon: "Settings", keywords: ["policies", "slots"] },
      { href: "/admin/audit-logs", label: "Audit logs", icon: "ScrollText", keywords: ["compliance", "history"] },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: "LineChart", keywords: ["reports", "distribution"] },
      { href: "/admin/system-health", label: "System health", icon: "Activity", keywords: ["uptime", "ops"] },
    ],
  },
] as const;

export function flattenPortalNav(sections: readonly PortalNavSection[]): PortalNavItem[] {
  return sections.flatMap((s) => [...s.items]);
}

/** Header bell: student sees notification center; counselor sees triage; admin sees console home. */
export function portalNotificationsHref(portal: PortalKind): string {
  if (portal === "student") return "/dashboard/notifications";
  if (portal === "counselor") return "/counselor/priority-queue";
  return "/admin";
}

/** Header chat — student + counselor only. */
export function portalChatHref(portal: PortalKind): string | null {
  if (portal === "student") return "/dashboard/chat";
  if (portal === "counselor") return "/counselor/chat";
  return null;
}
