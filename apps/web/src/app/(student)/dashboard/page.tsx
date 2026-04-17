"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/cn";
import { type AllocationStatus } from "@/lib/constants";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const SOFT_STYLE: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  GREEN:  { bg: "#E8F2EE", border: "#B8D4C0", dot: "#7BA89A",  text: "#3D5A54" },
  YELLOW: { bg: "#FEF4E0", border: "#E8D4B0", dot: "#D4900A",  text: "#A0700A" },
  RED:    { bg: "#FDEAEA", border: "#F5B8B8", dot: "#B03030",  text: "#B03030" },
};

const RISK_MESSAGE: Record<string, string> = {
  GREEN: "You're doing well.",
  YELLOW: "Some support is available.",
  RED: "You've been prioritised for care.",
};

function WaveProgress({ trend }: { trend: "IMPROVING" | "STABLE" | "WORSENING" }) {
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
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<any>("/students/me/dashboard");
        setDashboardData(response.data);
        setStatus(response.data.next_appointment?.status || "");
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleConfirm = async () => {
    if (!dashboardData?.next_appointment) return;
    try {
      setLoading(true);
      await api.post("/students/me/allocation/confirm", {
        idempotency_key: dashboardData.next_appointment.id
      });
      setStatus("CONFIRMED");
    } catch (err) {
      console.error("Failed to confirm appointment", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!dashboardData?.next_appointment) return;
    try {
      setLoading(true);
      await api.post("/students/me/allocation/reschedule", {
        idempotency_key: dashboardData.next_appointment.id
      });
      setStatus("RESCHEDULING");
    } catch (err) {
      console.error("Failed to request reschedule", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!dashboardData?.next_appointment) return;
    try {
      setLoading(true);
      await api.post("/students/me/allocation/decline", {
        idempotency_key: dashboardData.next_appointment.id
      });
      setStatus("DECLINED");
    } catch (err) {
      console.error("Failed to decline appointment", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState text="Loading your dashboard..." className="min-h-[50vh]" />;
  if (!dashboardData) return <ErrorState title="Unable to load dashboard" message="Please try again" onRetry={() => window.location.reload()} className="min-h-[50vh]" />;

  const m = dashboardData;
  const riskLevel = (m.risk_level || "GREEN") as keyof typeof SOFT_STYLE;
  const softStyle = SOFT_STYLE[riskLevel];
  const isConfirmed = status === "CONFIRMED";

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div className="animate-fade-up flex flex-col gap-1">
        <h1 className="font-serif text-[2.4rem] text-[#3D5A54] leading-tight">
          Good morning, {m.full_name?.split(' ')[0] || "there"}.
        </h1>
        <p className="font-sans font-normal text-[#3D5A54]/75">
          Here's what's on your plate today.
        </p>
      </div>

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
            {RISK_MESSAGE[riskLevel]}
          </p>
        </div>
        <p className="mt-2 font-sans font-normal text-sm text-[#3D5A54]/75 ml-6">
          Your next check-in is due on {m.next_assessment_due}.
          <Link href="/dashboard/assessment" className="ml-2 text-[#7BA89A] underline underline-offset-2">
            Take it now →
          </Link>
        </p>
      </Card>

      {m.next_appointment && (
        <Card className="animate-fade-up stagger-2" padding="md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">
                Upcoming appointment
              </p>
              <h2 className="font-serif text-xl text-[#3D5A54]">{m.next_appointment.counselor}</h2>
              <p className="font-sans font-normal text-sm text-[#3D5A54]/70">
                {m.next_appointment.date} · {m.next_appointment.time}
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
            {!isConfirmed && status !== "DECLINED" && status !== "RESCHEDULING" && (
              <Button id="confirm-appointment" size="md" onClick={handleConfirm} className="flex-1 sm:flex-none">
                Confirm appointment
              </Button>
            )}
            {status !== "DECLINED" && status !== "RESCHEDULING" && (
              <Button id="reschedule-appointment" variant="ghost" size="md" onClick={handleReschedule} className="flex-1 sm:flex-none">
                Reschedule
              </Button>
            )}
            {status !== "DECLINED" && status !== "RESCHEDULING" && (
              <Button id="decline-appointment" variant="outline" size="md" onClick={handleDecline} className="flex-1 sm:flex-none">
                Decline
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card className="animate-fade-up stagger-3" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">Your progress</p>
            <h2 className="font-serif text-xl text-[#3D5A54] mt-0.5">
              {m.recent_progress === "IMPROVING" ? "Moving forward" : m.recent_progress === "WORSENING" ? "Heading into deep waters" : "Steadily balanced"}
            </h2>
          </div>
          <Link
            href="/dashboard/progress"
            className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
          >
            Full timeline →
          </Link>
        </div>
        <WaveProgress trend={m.recent_progress} />
        <p className="font-sans text-xs font-normal text-[#3D5A54]/50 mt-2">
          Abstract trend based on your history. No scores — just direction.
        </p>
      </Card>

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
