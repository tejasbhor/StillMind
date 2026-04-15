"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import { cn } from "@/lib/cn";
import type { RiskLevel, TrendValue } from "@/lib/constants";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const ALERTS = [
  { id: "a1", type: "red-new",   label: "New RED case",            detail: "STU-004 classified RED after latest check-in.", time: "12m ago" },
  { id: "a2", type: "no-show",   label: "⚠️ Session missed (No-Show)", detail: "STU-002 did not attend the 9:00 AM slot. Engagement flag raised.", time: "2h ago" },
  { id: "a3", type: "worsening", label: "Worsening trend detected", detail: "STU-007 showing worsening trend across 3 check-ins.", time: "1d ago" },
];

const SCHEDULE = [
  { id: "s1", student: "STU-001", time: "9:00 AM",  status: "MISSED",    risk: "YELLOW" as RiskLevel },
  { id: "s2", student: "STU-003", time: "10:30 AM", status: "CONFIRMED", risk: "GREEN"  as RiskLevel },
  { id: "s3", student: "STU-005", time: "12:00 PM", status: "CONFIRMED", risk: "RED"    as RiskLevel },
  { id: "s4", student: "STU-008", time: "2:30 PM",  status: "SCHEDULED", risk: "YELLOW" as RiskLevel },
];

const QUEUE_PREVIEW: {
  id: string; studentId: string; initials: string;
  risk: RiskLevel; trend: TrendValue; lastSession: string; cri: number;
}[] = [
  { id: "q1", studentId: "STU-004", initials: "RK", risk: "RED",    trend: "WORSENING", lastSession: "12d ago", cri: 0.81 },
  { id: "q2", studentId: "STU-005", initials: "AM", risk: "RED",    trend: "STABLE",    lastSession: "7d ago",  cri: 0.74 },
  { id: "q3", studentId: "STU-007", initials: "PG", risk: "YELLOW", trend: "WORSENING", lastSession: "21d ago", cri: 0.52 },
  { id: "q4", studentId: "STU-011", initials: "NJ", risk: "YELLOW", trend: "STABLE",    lastSession: "14d ago", cri: 0.41 },
];

const SESSION_STATUS_CHIP: Record<string, string> = {
  CONFIRMED: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]",
  SCHEDULED: "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]",
  MISSED:    "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]",
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
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Good morning, Dr. Menon.</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          You have 4 sessions today and {QUEUE_PREVIEW.filter(q => q.risk === "RED").length} new RED cases in your queue.
        </p>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up stagger-1">
        {[
          { label: "Today's sessions",  value: "4",  sub: "1 missed",      color: "#3D5A54" },
          { label: "Priority queue",    value: "12", sub: "2 RED cases",   color: "#B03030" },
          { label: "Unread messages",   value: "2",  sub: "From 1 student", color: "#7BA89A" },
          { label: "Active alerts",     value: "3",  sub: "Needs review",  color: "#A0700A" },
        ].map((s) => (
          <Card key={s.label} padding="md" className="flex flex-col gap-1">
            <p className="font-sans text-xs text-[#3D5A54]/60">{s.label}</p>
            <p className="font-serif text-3xl" style={{ color: s.color }}>{s.value}</p>
            <p className="font-sans text-xs text-[#3D5A54]/40">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Workload overview ─────────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-1" padding="md">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Workload Capacity</h2>
            <span className="font-sans text-xs font-medium text-[#7BA89A] px-2.5 py-1 bg-[#E8F2EE] rounded-full">Balanced Allocation</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between font-sans text-sm text-[#3D5A54] font-medium">
                    <span>Clinical Limits (Today)</span>
                    <span>4 / 6 sessions</span>
                </div>
                <div className="w-full bg-[#E8F2EE] rounded-full h-2">
                    <div className="bg-[#7BA89A] h-2 rounded-full" style={{ width: "66%" }}></div>
                </div>
                <p className="font-sans text-xs text-[#3D5A54]/50">Optimal load, ready for crisis slots.</p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between font-sans text-sm text-[#3D5A54] font-medium">
                    <span>High-risk Caseload</span>
                    <span>2 RED active</span>
                </div>
                <div className="w-full bg-[#F5B8B8]/30 rounded-full h-2">
                    <div className="bg-[#B03030] h-2 rounded-full" style={{ width: "30%" }}></div>
                </div>
                <p className="font-sans text-xs text-[#3D5A54]/50">System load balancer prevents RED concentration.</p>
            </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Alerts panel ────────────────────────────────────────────────── */}
        <Card className="animate-fade-up stagger-2" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Alerts</h2>
            <span className="w-5 h-5 rounded-full bg-[#FDEAEA] text-xs text-[#B03030] flex items-center justify-center font-sans font-medium">
              {ALERTS.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {ALERTS.map((a) => (
              <div key={a.id} className="flex gap-3 items-start p-3 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0]">
                <span className={cn("text-lg mt-0.5 flex-shrink-0", ALERT_COLOR[a.type])}>
                  {ALERT_ICON[a.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">{a.label}</p>
                <p className="font-sans text-xs font-normal text-[#3D5A54]/75 mt-0.5">{a.detail}</p>
                </div>
                <span className="font-sans text-xs text-[#3D5A54]/30 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Today's schedule ──────────────────────────────────────────────── */}
        <Card className="animate-fade-up stagger-3" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Today's schedule</h2>
            <Link href="/counselor/schedule" className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B]">
              Full schedule →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {SCHEDULE.map((s) => (
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
                <RiskBadge level={s.risk} size="sm" clinical />
                <span className="font-sans text-sm text-[#3D5A54] flex-1">{s.student}</span>
                <span className={cn("text-xs font-sans rounded-full px-2.5 py-0.5 border", SESSION_STATUS_CHIP[s.status])}>
                  {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Priority queue preview ─────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-4" padding="md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg text-[#3D5A54]">Priority queue</h2>
          <Link href="/counselor/priority-queue" className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B]">
            View all 12 →
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {QUEUE_PREVIEW.map((q, i) => (
            <Link
              key={q.id}
              href={`/counselor/students/${q.studentId}`}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-all",
                q.risk === "RED"
                  ? "border-[#F5B8B8] bg-[#FDEAEA]/40 hover:bg-[#FDEAEA] animate-pulse-ring"
                  : "border-[#E8F2EE] bg-white hover:border-[#B8D4C0]",
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Rank */}
              <span className="font-sans text-sm text-[#3D5A54]/30 w-5 flex-shrink-0">#{i + 1}</span>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-sans text-sm font-medium"
                style={{
                  background: q.risk === "RED" ? "#FDEAEA" : "#E8F2EE",
                  color: q.risk === "RED" ? "#B03030" : "#3D5A54",
                }}
              >
                {q.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-[#3D5A54]">{q.studentId}</p>
                <p className="font-sans text-xs text-[#3D5A54]/40">Last session: {q.lastSession}</p>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <RiskBadge level={q.risk} size="sm" clinical pulse={q.risk === "RED"} />
                <TrendIndicator trend={q.trend} size="sm" />
              </div>

              {/* CRI */}
              <span className="font-sans text-sm font-medium text-[#3D5A54] w-10 text-right flex-shrink-0">
                {q.cri.toFixed(2)}
              </span>

              {/* Left border for RED */}
              {q.risk === "RED" && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#B03030] opacity-60" />
              )}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
