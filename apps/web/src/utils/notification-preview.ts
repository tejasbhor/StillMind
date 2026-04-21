import type { NotificationItem } from "@/services/api";

export function formatNotificationTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function notificationPreviewBody(n: NotificationItem): string {
  const p = n.payload;
  if (typeof p === "object" && p && "message" in p && typeof (p as { message?: string }).message === "string") {
    return (p as { message: string }).message;
  }
  if (typeof p === "object" && p && "body" in p && typeof (p as { body?: string }).body === "string") {
    return (p as { body: string }).body;
  }
  return n.template_code.replace(/_/g, " ");
}
