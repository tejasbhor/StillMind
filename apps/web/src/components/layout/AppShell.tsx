"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarItem,
  SidebarSectionLabel,
  SidebarRailToggle,
  useSidebar,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
} from "@/components/ui/Sidebar";
import Logo from "@/components/brand/Logo";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/hooks/auth-store";
import Avatar from "@/components/ui/Avatar";
import { useNotificationUnread } from "@/hooks/use-notification-unread";
import { notificationsApi, type NotificationItem } from "@/services/api";
import { formatNotificationTime, notificationPreviewBody } from "@/utils/notification-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import {
  LogOut,
  UserRound,
  BellRing,
  Search,
  Menu,
  PanelLeftOpen,
  Bell,
  MessageCircle,
} from "lucide-react";
import type { PortalNavItem, PortalNavSection } from "@/utils/portal-nav";
import {
  PORTAL_NAV_ICONS,
  type PortalKind,
  portalChatHref,
  portalNotificationsHref,
} from "@/utils/portal-nav";

type NavSection = PortalNavSection;

function matchesSearch(item: PortalNavItem, q: string): boolean {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    item.label.toLowerCase().includes(s) ||
    item.href.toLowerCase().includes(s) ||
    (item.keywords ?? []).some((k) => k.includes(s))
  );
}

function deriveHomeHref(sections: readonly NavSection[]): string {
  const first = sections[0]?.items[0]?.href ?? "";
  if (first.startsWith("/admin")) return "/admin";
  if (first.startsWith("/counselor")) return "/counselor";
  return "/dashboard";
}

function HeaderAccountMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const displayName =
    user?.email?.split("@")[0]?.replace(/\./g, " ")?.trim() || "Account";
  const initials = (displayName[0] || "U").toUpperCase();

  const profileHref =
    user?.role === "student"
      ? "/dashboard/profile"
      : user?.role === "counselor"
        ? "/counselor"
        : user?.role === "admin"
          ? "/admin"
          : null;
  const notificationSettingsHref =
    user?.role === "student" ? "/dashboard/notifications-settings" : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full border border-teal/12 bg-white/95 py-1 pl-1 pr-2 shadow-sm transition-colors",
            "hover:border-teal/20 hover:bg-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2"
          )}
          aria-label="Account menu"
        >
          <span className="relative">
            <Avatar size="sm" fallback={initials} className="shrink-0" />
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-sage"
              aria-hidden
            />
          </span>
          <span className="hidden max-w-[140px] truncate font-sans text-sm font-semibold text-teal-dark sm:inline">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <div className="px-3 pb-2">
          <p className="truncate font-sans text-sm font-semibold text-teal-dark">
            {user?.email ?? "—"}
          </p>
          <p className="mt-1 font-sans text-xs text-teal/60">
            Role: <span className="font-semibold">{user?.role ?? "—"}</span>
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!profileHref}
          onSelect={() => profileHref && router.push(profileHref)}
          className="gap-2"
        >
          <UserRound className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!notificationSettingsHref}
          onSelect={() =>
            notificationSettingsHref && router.push(notificationSettingsHref)
          }
          className="gap-2"
        >
          <BellRing className="h-4 w-4" /> Notification preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await logout();
            router.push("/login");
          }}
          className="gap-2 text-[#B03030] focus:text-[#B03030]"
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderNotificationsDropdown({
  notificationsHref,
  unread,
  refresh,
}: {
  notificationsHref: string;
  unread: number;
  refresh: () => Promise<void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await notificationsApi.list({ limit: 8 });
        if (!cancelled) setItems(res.data ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={(next) => {
      setOpen(next);
      if (next) void refresh();
    }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-white text-teal transition-colors hover:bg-foam",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2"
          )}
          aria-label="Notifications"
          aria-expanded={open}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sage px-1 text-[10px] font-bold text-white tabular-nums">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-1.5rem),22rem)] p-0">
        <div className="border-b border-teal/10 px-3 py-2.5">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.18em] text-teal/50">
            Notifications
          </p>
        </div>
        <div className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
          {loading ? (
            <p className="px-3 py-4 font-sans text-sm text-teal/55">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-4 font-sans text-sm text-teal/55">Nothing new here yet.</p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex cursor-pointer flex-col items-start gap-0.5 rounded-none px-3 py-2.5 focus:bg-teal/[0.06]"
                onSelect={() => {
                  void notificationsApi.markRead(n.id).catch(() => {});
                  void refresh();
                  router.push(notificationsHref);
                }}
              >
                <span className="font-sans text-[10px] text-teal/45">
                  {formatNotificationTime(n.created_at)}
                </span>
                <span
                  className={cn(
                    "line-clamp-2 text-left font-sans text-sm text-teal-dark",
                    !n.is_read && "font-semibold"
                  )}
                >
                  {notificationPreviewBody(n)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          className="cursor-pointer justify-center py-2.5 font-sans text-sm font-semibold text-sage focus:text-teal"
          onSelect={() => {
            router.push(notificationsHref);
            void refresh();
          }}
        >
          See all →
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ShellTopBar({
  title,
  portal,
  navSearch,
  setNavSearch,
}: {
  title: string;
  portal: PortalKind;
  navSearch: string;
  setNavSearch: (v: string) => void;
}) {
  const { init } = useAuthStore();
  const { setExpanded, isMobile } = useSidebar();
  const { unread, refresh } = useNotificationUnread();
  const searchRef = useRef<HTMLInputElement>(null);

  const notificationsHref = portalNotificationsHref(portal);
  const chatHref = portalChatHref(portal);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-[4.25rem] shrink-0 flex-col gap-2 border-b border-teal/10 bg-white/90 px-3 py-2 backdrop-blur-xl sm:px-4 md:h-[4.25rem] md:flex-row md:items-center md:gap-3 md:py-0 lg:gap-4 lg:px-6">
      <div className="flex min-w-0 shrink-0 items-center gap-2 md:max-w-[220px] lg:max-w-[260px]">
        {isMobile && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-white text-teal transition-colors hover:bg-foam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-teal/50">
            StillMind
          </p>
          <p className="truncate font-serif text-lg font-semibold text-teal-dark sm:text-xl">
            {title}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-4 md:gap-6">
        <div className="w-full max-w-[280px] lg:max-w-[340px]">
          <label className="relative block w-full">
            <span className="sr-only">Search navigation</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal/40" />
            <input
              ref={searchRef}
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search anything…"
              className="w-full rounded-full border border-teal/12 bg-[#F5F7F6] py-2.5 pl-10 pr-14 font-sans text-sm text-teal-dark placeholder:text-teal/35 focus:border-teal/25 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-mid/25 md:pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-teal/15 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-teal/45 md:inline">
              ⌘ K
            </kbd>
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <HeaderNotificationsDropdown
            notificationsHref={notificationsHref}
            unread={unread}
            refresh={refresh}
          />

          {chatHref ? (
            <Link
              href={chatHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal/10 bg-white text-teal transition-colors hover:bg-foam"
              aria-label="Messages"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </Link>
          ) : null}

          <HeaderAccountMenu />
        </div>
      </div>
    </header>
  );
}

function AppShellInner({
  sections,
  title,
  portal,
  children,
}: {
  sections: readonly NavSection[];
  title: string;
  portal: PortalKind;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setExpanded, isMobile, expanded } = useSidebar();

  const [navSearch, setNavSearch] = useState("");

  const filteredSections = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter((item) => matchesSearch(item, q)),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [sections, navSearch]);

  const homeHref = deriveHomeHref(sections);

  useEffect(() => {
    if (isMobile) setExpanded(false);
  }, [pathname, isMobile, setExpanded]);

  return (
    <>
      <Sidebar>
        <SidebarHeader className="gap-2">
          {expanded ? (
            <>
              <Logo
                href={homeHref}
                iconSize="sm"
                className="min-w-0 max-w-[min(100%,220px)] shrink"
              />
              <SidebarRailToggle />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-white/90 text-teal transition-colors hover:bg-foam hover:border-teal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2"
              aria-label="Expand sidebar"
            >
              <span className="pointer-events-none transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0">
                <Logo variant="iconOnly" suppressLink iconSize="sm" />
              </span>
              <PanelLeftOpen
                className="pointer-events-none absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden
              />
            </button>
          )}
        </SidebarHeader>

        <SidebarContent>
          {filteredSections.length === 0 ? (
            <p className="px-3 py-6 text-center font-sans text-xs text-teal/50">
              No pages match “{navSearch.trim()}”.
            </p>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <SidebarSectionLabel label={section.label} />
                <nav className="mt-3 flex flex-col gap-3" aria-label={section.label}>
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = PORTAL_NAV_ICONS[item.icon];
                    return (
                      <SidebarItem
                        key={item.href}
                        href={item.href}
                        active={active}
                        icon={<Icon className="h-[18px] w-[18px]" />}
                        label={item.label}
                      />
                    );
                  })}
                </nav>
              </div>
            ))
          )}
        </SidebarContent>
      </Sidebar>

      <div
        className="flex h-screen min-h-0 min-w-0 flex-col transition-[padding] duration-200 ease-out motion-reduce:transition-none"
        style={{
          paddingLeft: isMobile
            ? 0
            : expanded
              ? SIDEBAR_WIDTH_EXPANDED
              : SIDEBAR_WIDTH_COLLAPSED,
        }}
      >
        <ShellTopBar
          title={title}
          portal={portal}
          navSearch={navSearch}
          setNavSearch={setNavSearch}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7F6]">
          <div className="w-full px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5 xl:px-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function AppShell({
  sections,
  title,
  portal,
  children,
}: {
  sections: readonly NavSection[];
  title: string;
  portal: PortalKind;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppShellInner sections={sections} title={title} portal={portal}>
        {children}
      </AppShellInner>
    </SidebarProvider>
  );
}
