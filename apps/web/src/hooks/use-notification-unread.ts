"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsApi } from "@/services/api";
import { tokenStore } from "@/services/api";

/**
 * Unread notification count for the signed-in user.
 * Returns 0 when unauthenticated or on API failure (graceful degradation).
 */
export function useNotificationUnread(): { unread: number; refresh: () => Promise<void> } {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !tokenStore.getAccess()) {
      setUnread(0);
      return;
    }
    try {
      const res = await notificationsApi.list({ limit: 100, unread_only: true });
      setUnread(Array.isArray(res.data) ? res.data.length : 0);
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0);
    const id = window.setInterval(() => void refresh(), 60000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [refresh]);

  return { unread, refresh };
}
