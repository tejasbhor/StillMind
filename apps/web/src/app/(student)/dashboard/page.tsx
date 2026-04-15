"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { type AllocationStatus } from "@/lib/constants";

// ── Mock data (replace with API calls) ────────────────────────────────────────
const MOCK = {
  firstName: "Alex",
  riskLevel: "YELLOW" as const,
  softLabel: "Some support is available",
  appointment: {
    counselor:  "Dr. Priya Menon",
    date:       "Wednesday, 16 April 2026",
    time:       "10:30 AM",
    status:     "ASSIGNED" as AllocationStatus,
    daysUntil:  1,
  },
  trend: "STABLE" as const,
  progressLabel: "Moving steadily",
  notifications: [
    { id: "1", text: "Your appointment with Dr. Menon is confirmed for tomorrow.", time: "2h ago" },
    { id: "2", text: "Time for your fortnightly check-in — takes about 4 minutes.", time: "1d ago" },
  ],
  lastAssessment: "2 April 2026",
  nextAssessment: "16 April 2026",
};

const SOFT_STYLE: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  GREEN:  { bg: "#E8F2EE", border: "#B8D4C0", dot: "#7BA89A",  text: "#3D5A54" },
  YELLOW: { bg: "#FEF4E0", border: "#E8D4B0", dot: "#D4900A",  text: "#A0700A" },
  RED:    { bg: "#FDEAEA", border: "#F5B8B8", dot: "#B03030",  text: "#B03030" },
};

function WaveProgress({ trend }: { trend: "IMPROVING" | "STABLE" | "WORSENING" }) {
  // Abstract wave — purely decorative
  const paths = {
    IMPROVING: "M0,40 C30,38 60,25 90,20 C120,15 150,10 180,8 C210,6 240,8 270,10 L270,60 L0,60Z",
    STABLE:    "M0,35 C30,33 60,37 90,35 C120,33 150,37 180,35 C210,33 240,37 270,35 L270,60 L0,60Z",
    WORSENING: "M0,20 C30,22 60,30 90,35 C120,40 150,45 180,48 C210,51 240,52 270,50 L270,60 L0,60Z",
  };
  const colors = {
    IMPROVING: "#7BA89A",
    STABLE:    "#7F96B8",
    WORSENING: "#B03030",
  };
  return (
    <svg viewBox="0 0 270 60" className="w-full h-14" aria-hidden>
      <path d={paths[trend]} fill={colors[trend]} fillOpacity="0.18" />
      <path d={paths[trend]} fill="none" stroke={colors[trend]} strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}

export default function StudentDashboard() {
  const m = MOCK;
  const softStyle = SOFT_STYLE[m.riskLevel];
  const [status, setStatus] = useState<string>(m.appointment.status);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatus("CONFIRMED");
    setLoading(false);
  };

  const isConfirmed = status === "CONFIRMED";
  const isPending = status === "ASSIGNED" || status === "PENDING_RANKING";

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="animate-fade-up flex flex-col gap-1">
        <h1 className="font-serif text-[2.4rem] text-[#3D5A54] leading-tight">
          Good morning, {m.firstName}.
        </h1>
        <p className="font-sans font-normal text-[#3D5A54]/75">
          Here's what's on your plate today.
        </p>
      </div>

      {/* ── Current state badge ────────────────────────────────────────────── */}
      <Card
        className={cn("animate-fade-up stagger-1 border")}
        style={{ background: softStyle.bg, borderColor: softStyle.border }}
        hover={false}
        padding="md"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: softStyle.dot }}
          />
          <p className="font-serif text-xl" style={{ color: softStyle.text }}>
            {m.softLabel}
          </p>
        </div>
        <p className="mt-2 font-sans font-normal text-sm text-[#3D5A54]/75 ml-6">
          Your next check-in is due on {m.nextAssessment}.
          <Link href="/dashboard/assessment" className="ml-2 text-[#7BA89A] underline underline-offset-2">
            Take it now →
          </Link>
        </p>
      </Card>

      {/* ── Appointment card ───────────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-2" padding="md">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">
              Upcoming appointment
            </p>
            <h2 className="font-serif text-xl text-[#3D5A54]">{m.appointment.counselor}</h2>
            <p className="font-sans font-normal text-sm text-[#3D5A54]/70">
              {m.appointment.date} · {m.appointment.time}
            </p>
          </div>
          <span
            className={cn(
              "text-xs font-sans font-medium rounded-full px-3 py-1 border",
              isConfirmed
                ? "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]"
                : status === "DECLINED"
                ? "bg-[#FAFAFA] text-[#3D5A54]/50 border-[#E8F2EE]"
                : status === "RESCHEDULING"
                ? "bg-[#E8EEF5] text-[#7F96B8] border-[#C4D4E8]"
                : "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]"
            )}
          >
            {isConfirmed ? "Confirmed" : status === "DECLINED" ? "Declined" : status === "RESCHEDULING" ? "In priority queue" : "Awaiting confirmation"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {(!isConfirmed && status !== "DECLINED" && status !== "RESCHEDULING") && (
            <Button id="confirm-appointment" size="md" loading={loading} onClick={handleConfirm} className="flex-1 sm:flex-none">
              Confirm appointment
            </Button>
          )}
          {(status !== "DECLINED" && status !== "RESCHEDULING") && (
            <Button id="reschedule-appointment" variant="ghost" size="md" onClick={() => setStatus("RESCHEDULING")} className="flex-1 sm:flex-none">
              Reschedule
            </Button>
          )}
          {(status !== "DECLINED" && status !== "RESCHEDULING") && (
            <Button id="decline-appointment" variant="outline" size="md" onClick={() => setStatus("DECLINED")} className="flex-1 sm:flex-none">
              Decline
            </Button>
          )}
        </div>

        {m.appointment.daysUntil <= 1 && (
          <div className="mt-4 rounded-lg bg-[#FEF4E0] border border-[#E8D4B0] px-4 py-2.5">
            <p className="font-sans text-xs text-[#A0700A]">
              ↑ Your appointment is tomorrow — please confirm by this evening.
            </p>
          </div>
        )}
      </Card>

      {/* ── Progress ───────────────────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-3" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">Your progress</p>
            <h2 className="font-serif text-xl text-[#3D5A54] mt-0.5">{m.progressLabel}</h2>
          </div>
          <Link
            href="/dashboard/progress"
            className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
          >
            Full timeline →
          </Link>
        </div>
        <WaveProgress trend={m.trend} />
        <p className="font-sans text-xs font-normal text-[#3D5A54]/50 mt-2">
          Abstract trend since your last check-in on {m.lastAssessment}. No scores — just direction.
        </p>
      </Card>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#3D5A54]">Recent updates</h2>
          <Link
            href="/dashboard/notifications"
            className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
          >
            View all →
          </Link>
        </div>

        {m.notifications.map((n) => (
          <Card key={n.id} padding="sm" className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded-full bg-[#7BA89A] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-sans text-sm text-[#3D5A54]/85 leading-relaxed">{n.text}</p>
              <p className="font-sans text-xs text-[#3D5A54]/50 mt-1">{n.time}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────────*/}
      <div className="animate-fade-up stagger-5 grid grid-cols-2 sm:grid-cols-3 gap-3 pb-8">
        {[
          { href: "/dashboard/assessment",   label: "Start check-in",    emoji: "✎" },
          { href: "/dashboard/chat",         label: "Message counsellor", emoji: "◎" },
          { href: "/dashboard/appointments", label: "My appointments",   emoji: "◫" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card flex flex-col items-center gap-2 p-5 text-center"
          >
            <span className="text-2xl text-[#7BA89A]">{a.emoji}</span>
            <span className="font-sans text-sm font-medium text-[#3D5A54]">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
