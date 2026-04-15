"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Mock notification data following the API contract
const MOCK_NOTIFICATIONS = [
  {
    notification_id: "not_1",
    template_code: "PHQ9_REMINDER",
    message: "Time for your weekly check-in. This helps us track your progress.",
    type: "IMPORTANT",
    timestamp: "2 hours ago",
    is_read: false,
  },
  {
    notification_id: "not_2",
    template_code: "APPOINTMENT_CONFIRMED",
    message: "Your session with Dr. Priya Menon is confirmed for tomorrow at 10:00 AM.",
    type: "INFO",
    timestamp: "5 hours ago",
    is_read: true,
  },
  {
    notification_id: "not_3",
    template_code: "RESOURCE_SUGGESTION",
    message: "New wellness resource: 'Managing Academic Stress' is now available in your library.",
    type: "INFO",
    timestamp: "1 day ago",
    is_read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">Notifications</h1>
          <p className="font-sans font-normal text-sm text-[#3D5A54]/60 mt-1">
            Stay updated with your care plan and reminders.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="font-sans text-xs font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors p-2"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4 animate-fade-up stagger-1">
        {notifications.length === 0 ? (
          <Card className="text-center py-12" padding="lg">
            <p className="font-sans text-sm text-[#3D5A54]/40">No notifications yet.</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.notification_id}
              className={cn(
                "group relative transition-all duration-300",
                !n.is_read ? "border-[#B8D4C0] bg-[#FAFCFA]" : "bg-white/50 opacity-80"
              )}
              padding="md"
            >
              {!n.is_read && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#7BA89A] rounded-full" />
              )}
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  n.type === "IMPORTANT" ? "bg-[#FDEAEA] text-[#B03030]" : "bg-[#E8F2EE] text-[#3D5A54]"
                )}>
                  {n.type === "IMPORTANT" ? "!" : "i"}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-sans text-xs font-medium tracking-widest uppercase",
                      n.type === "IMPORTANT" ? "text-[#B03030]" : "text-[#3D5A54]/40"
                    )}>
                      {n.template_code.replace("_", " ")}
                    </p>
                    <span className="font-sans text-[10px] text-[#3D5A54]/30">{n.timestamp}</span>
                  </div>
                  <p className="font-sans text-sm text-[#3D5A54] leading-relaxed">
                    {n.message}
                  </p>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.notification_id)}
                      className="mt-2 w-max font-sans text-xs font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Preferences link */}
      <div className="animate-fade-up stagger-2 rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3 flex items-center justify-between">
        <p className="font-sans text-xs font-normal text-[#3D5A54]/70">
          Want to change how you receive alerts?
        </p>
        <Button variant="ghost" size="sm" className="text-xs">
          Notification Settings
        </Button>
      </div>
    </div>
  );
}
