"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import { notificationsApi, type NotificationItem } from "@/services/api";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatNotificationTime, notificationPreviewBody } from "@/utils/notification-preview";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await notificationsApi.list({ limit: 50 });
      setNotifications(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      /* best-effort */
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      /* best-effort */
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return <LoadingState text="Loading notifications…" className="min-h-[40vh]" />;
  }

  if (error) {
    return (
      <ErrorState title="Unable to load notifications" message={error} onRetry={() => void load()} className="min-h-[40vh]" />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="animate-fade-up flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-teal-dark">Notifications</h1>
          <p className="mt-1 font-sans text-sm text-teal/60">
            Stay updated with your care plan and reminders.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            className="p-2 font-sans text-xs font-medium text-sage transition-colors hover:text-teal"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="animate-fade-up stagger-1 flex flex-col gap-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.659 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            }
            title="All caught up"
            description="You don&apos;t have any notifications yet. We&apos;ll notify you when there&apos;s something important."
          />
        ) : (
          notifications.map((n) => {
            const text = notificationPreviewBody(n);
            const important = n.template_code.includes("URGENT") || n.template_code.includes("RED");
            return (
              <Card
                key={n.id}
                className={cn(
                  "group relative transition-all duration-300",
                  !n.is_read ? "border-mist bg-[#FAFCFA]" : "bg-white/50 opacity-90"
                )}
                padding="md"
              >
                {!n.is_read && (
                  <div className="absolute -left-1 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-sage" />
                )}
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-sans text-sm",
                      important ? "bg-[#FDEAEA] text-[#B03030]" : "bg-[#E8F2EE] text-teal-dark"
                    )}
                  >
                    {important ? "!" : "i"}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "font-sans text-xs font-medium uppercase tracking-widest",
                          important ? "text-[#B03030]" : "text-teal/40"
                        )}
                      >
                        {n.template_code.replace(/_/g, " ")}
                      </p>
                      <span className="shrink-0 font-sans text-[10px] text-teal/35">{formatNotificationTime(n.created_at)}</span>
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-teal-dark">{text}</p>
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => void markAsRead(n.id)}
                        className="mt-2 w-max font-sans text-xs font-medium text-sage transition-colors hover:text-teal"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="animate-fade-up stagger-2 flex items-center justify-between rounded-xl border border-mist bg-[#E8F2EE] px-4 py-3">
        <p className="font-sans text-xs font-normal text-teal/70">
          Want to change how you receive alerts?
        </p>
        <Link
          href="/dashboard/notifications-settings"
          className="font-sans text-xs font-semibold text-sage underline-offset-2 hover:text-teal hover:underline"
        >
          Notification settings
        </Link>
      </div>
    </div>
  );
}
