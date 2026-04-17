"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { RiskLevel, TrendValue } from "@/lib/constants";

const SESSION_STATUS_CHIP: Record<string, string> = {
  CONFIRMED: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]",
  SCHEDULED: "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]",
  MISSED:    "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]",
  ASSIGNED:  "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]",
};

const ALERT_ICON: Record<string, string> = {
  "red-new":   "◉",
  "no-show":   "◌",
  "worsening": "↓",
};

const ALERT_COLOR: Record<string, string> = {
  "red-new":   "text-[#B03030]",
  "no-show":   "text-[#A0700A]",
  "worsening": "text-[#B03030]",
};

export default function CounselorDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<any>("/counselors/me/dashboard");
        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to fetch counselor dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center font-serif text-[#3D5A54]">Loading your workspace...</div>;
  if (!dashboardData) return <div className="p-8 text-center font-serif text-[#3D5A54]">Failed to load dashboard.</div>;

  const m = dashboardData;

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Good morning, {m.full_name?.split(' ')[0] || "Counselor"}.</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          You have {m.today_schedule.length} sessions today and {m.priority_queue_count} students in your queue.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up stagger-1">
        {[
          { label: "Today's sessions",  value: m.today_schedule.length.toString(),  sub: "Active slots",      color: "#3D5A54" },
          { label: "Priority queue",    value: m.priority_queue_count.toString(), sub: "Needs review",   color: "#B03030" },
          { label: "Unread messages",   value: m.unread_messages.toString(),  sub: "Student chat", color: "#7BA89A" },
          { label: "Active alerts",     value: m.alerts.length.toString(),  sub: "High priority",  color: "#A0700A" },
        ].map((s) => (
          <Card key={s.label} padding="md" className="flex flex-col gap-1">
            <p className="font-sans text-xs text-[#3D5A54]/60">{s.label}</p>
            <p className="font-serif text-3xl" style={{ color: s.color }}>{s.value}</p>
            <p className="font-sans text-xs text-[#3D5A54]/40">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-fade-up stagger-2" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Alerts</h2>
            <span className="w-5 h-5 rounded-full bg-[#FDEAEA] text-xs text-[#B03030] flex items-center justify-center font-sans font-medium">
              {m.alerts.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {m.alerts.length === 0 ? (
              <p className="text-center font-sans text-sm text-[#3D5A54]/40 py-8">No active alerts.</p>
            ) : (
              m.alerts.map((a: any) => (
                <div key={a.id} className="flex gap-3 items-start p-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0]">
                  <span className={cn("text-lg mt-0.5 flex-shrink-0", ALERT_COLOR[a.type])}>
                    {ALERT_ICON[a.type] || "◉"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-[#3D5A54]">{a.label}</p>
                    <p className="font-sans text-xs font-normal text-[#3D5A54]/75 mt-0.5">{a.detail}</p>
                  </div>
                  <span className="font-sans text-xs text-[#3D5A54]/30 flex-shrink-0">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="animate-fade-up stagger-3" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Today's schedule</h2>
            <Link href="/counselor/schedule" className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B]">
              Full schedule →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {m.today_schedule.length === 0 ? (
              <p className="text-center font-sans text-sm text-[#3D5A54]/40 py-8">No sessions today.</p>
            ) : (
              m.today_schedule.map((s: any) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 border transition-all cursor-pointer",
                    selectedSession === s.id
                      ? "border-[#7BA89A] bg-[#E8F2EE]"
                      : "border-[#E8F2EE] bg-white hover:border-[#B8D4C0]"
                  )}
                  onClick={() => setSelectedSession(s.id)}
                >
                  <span className="font-sans text-xs text-[#3D5A54]/40 w-16 flex-shrink-0">{s.time}</span>
                  <RiskBadge level={s.risk as RiskLevel} size="sm" clinical />
                  <span className="font-sans text-sm text-[#3D5A54] flex-1">{s.student}</span>
                  <span className={cn("text-xs font-sans rounded-full px-2.5 py-0.5 border", SESSION_STATUS_CHIP[s.status] || SESSION_STATUS_CHIP.SCHEDULED)}>
                    {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="animate-fade-up stagger-4" padding="md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg text-[#3D5A54]">Quick Actions</h2>
          <div className="flex gap-3">
             <Link href="/counselor/priority-queue">
              <Button variant="outline" size="sm">Open Priority Queue</Button>
            </Link>
            <Link href="/counselor/chat">
              <Button size="sm">Open Messaging</Button>
            </Link>
          </div>
        </div>
        {/* Placeholder or simple list for queue since we handle it in full page */}
        <p className="font-sans text-sm text-[#3D5A54]/60">
          The system has prioritized {m.priority_queue_count} students requiring your attention. 
          Use the Priority Queue to manage allocations and review assessments.
        </p>
      </Card>
    </div>
  );
}
