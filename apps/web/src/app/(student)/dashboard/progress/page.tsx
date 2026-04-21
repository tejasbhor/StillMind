"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { api, studentApi } from "@/services/api";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";

type DashboardPayload = {
  full_name?: string;
  recent_progress?: string;
  risk_level?: string;
  sessions_history_count?: number;
};

type AssessmentRow = { id: string; assessment_type: string; risk_processing_status: string; created_at: string };

type SessionRow = {
  session_id: string;
  counselor_name: string;
  session_date: string | null;
  status: string;
  created_at: string;
};

type SummaryRow = {
  session_date: string | null;
  counselor_name: string;
  key_concerns: string[];
  progress_summary: string;
  action_plan: string;
};

type TimelineItem = {
  id: string;
  sortKey: number;
  dateLabel: string;
  timeLabel: string;
  type: "session" | "checkin";
  label: string;
  detail: string;
  status: "future" | "done" | "missed";
};

function parseTime(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function fmtDate(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: "—", time: "" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { date: "—", time: "" };
  }
}

function WaveProgress({ trend }: { trend: string }) {
  const t = trend === "IMPROVING" ? "IMPROVING" : trend === "WORSENING" ? "WORSENING" : "STABLE";
  const paths: Record<string, string> = {
    IMPROVING: "M0,40 C30,38 60,25 90,20 C120,15 150,10 180,8 C210,6 240,8 270,10 L270,60 L0,60Z",
    STABLE: "M0,35 C30,33 60,37 90,35 C120,33 150,37 180,35 C210,33 240,37 270,35 L270,60 L0,60Z",
    WORSENING: "M0,20 C30,22 60,30 90,35 C120,40 150,45 180,48 C210,51 240,52 270,50 L270,60 L0,60Z",
  };
  const colors: Record<string, string> = {
    IMPROVING: "#7BA89A",
    STABLE: "#7F96B8",
    WORSENING: "#B03030",
  };
  return (
    <svg viewBox="0 0 270 60" className="h-14 w-full" aria-hidden>
      <path d={paths[t]} fill={colors[t]} fillOpacity="0.18" />
      <path d={paths[t]} fill="none" stroke={colors[t]} strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [insight, setInsight] = useState<SummaryRow | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "sessions" | "checkins">("all");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [dashRes, assessRes, sessRes, sumRes] = await Promise.all([
        api.get<{ data: DashboardPayload }>("/students/me/dashboard"),
        studentApi.getAssessments(50, 0),
        studentApi.getSessions(50, 0),
        studentApi.getSessionSummaries(10, 0),
      ]);

      const d = (dashRes as { data?: DashboardPayload }).data ?? {};
      setDashboard(d);

      const rawA = assessRes as { data?: AssessmentRow[] };
      const assessments = Array.isArray(rawA?.data) ? rawA.data : [];
      const rawS = sessRes as { data?: SessionRow[] };
      const sessions = Array.isArray(rawS?.data) ? rawS.data : [];
      const rawSum = sumRes as { data?: SummaryRow[] };
      const summaries = Array.isArray(rawSum?.data) ? rawSum.data : [];
      setInsight(summaries[0] ?? null);

      const items: TimelineItem[] = [];

      for (const a of assessments) {
        const { date, time } = fmtDate(a.created_at);
        items.push({
          id: `a-${a.id}`,
          sortKey: parseTime(a.created_at),
          dateLabel: date,
          timeLabel: time,
          type: "checkin",
          label: "Check-in submitted",
          detail: `${a.assessment_type.replace(/_/g, " ")} · ${a.risk_processing_status === "DONE" ? "Processed" : "Processing"}`,
          status: "done",
        });
      }

      for (const s of sessions) {
        const iso = s.session_date || s.created_at;
        const { date, time } = fmtDate(iso);
        const st = s.status;
        const isMissed = st === "MISSED" || st === "CANCELLED";
        const isFuture = st === "SCHEDULED" || st === "CONFIRMED";
        items.push({
          id: `s-${s.session_id}`,
          sortKey: parseTime(iso),
          dateLabel: date,
          timeLabel: time,
          type: "session",
          label:
            st === "COMPLETED"
              ? "Session completed"
              : isMissed
                ? "Session missed"
                : isFuture
                  ? "Upcoming session"
                  : `Session · ${st}`,
          detail: s.counselor_name,
          status: isMissed ? "missed" : isFuture ? "future" : "done",
        });
      }

      items.sort((a, b) => b.sortKey - a.sortKey);
      setTimeline(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    return timeline.filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "sessions") return item.type === "session";
      return item.type === "checkin";
    });
  }, [timeline, activeTab]);

  const trend = dashboard?.recent_progress === "N/A" ? "STABLE" : dashboard?.recent_progress || "STABLE";
  const headline =
    trend === "IMPROVING" ? "Moving forward" : trend === "WORSENING" ? "Needs attention" : "Steadily balanced";

  if (loading) return <LoadingState text="Loading your progress…" className="min-h-[50vh]" />;
  if (error) return <ErrorState title="Unable to load progress" message={error} onRetry={() => void load()} className="min-h-[50vh]" />;

  const firstName = dashboard?.full_name?.split(" ")[0] || "there";

  return (
    <div className="flex max-w-3xl flex-col gap-10 pb-20">
      <div className="animate-fade-up">
        <h1 className="font-serif text-[2.6rem] leading-tight text-[#3D5A54]">Your journey</h1>
        <p className="mt-2 font-sans text-base font-normal text-[#3D5A54]/60">
          Tracking your progress is part of the healing. No grades, no judgment—only steps forward.
        </p>
      </div>

      {insight && (
        <div className="animate-fade-up stagger-1">
          <Card className="relative overflow-hidden border-none bg-[#3D5A54] text-white" padding="lg">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7BA89A] font-serif text-white">
                  {insight.counselor_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-sans text-xs font-medium uppercase tracking-widest opacity-60">Counselor&apos;s last note</p>
                  <p className="font-sans text-sm font-medium">{insight.counselor_name}</p>
                </div>
              </div>
              <p className="font-serif text-xl italic leading-relaxed">&ldquo;{insight.action_plan}&rdquo;</p>
              {insight.key_concerns?.length ? (
                <p className="font-sans text-xs opacity-70">Themes: {insight.key_concerns.join(" · ")}</p>
              ) : null}
              <Link href="/dashboard/chat">
                <Button className="border-none bg-[#7BA89A] px-6 text-sm hover:bg-[#6C9688]">Message your counselor</Button>
              </Link>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#7BA89A]/10" />
          </Card>
        </div>
      )}

      <Card className="animate-fade-up stagger-2" padding="lg">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-xs font-medium uppercase tracking-widest text-[#7BA89A]">Overall direction</p>
            <h2 className="mt-1 font-serif text-3xl text-[#3D5A54]">{headline}</h2>
            <p className="mt-1 font-sans text-xs text-[#3D5A54]/50">Based on your latest check-ins ({dashboard?.risk_level || "—"} risk band).</p>
          </div>
        </div>
        <WaveProgress trend={trend} />
        <p className="mt-2 font-sans text-xs font-normal text-[#3D5A54]/50">Abstract trend from your history—not a clinical score.</p>
      </Card>

      <div className="animate-fade-up stagger-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#3D5A54]">Your timeline</h2>
          <div className="flex gap-2 rounded-xl border border-[#B8D4C0] bg-[#E8F2EE] p-1">
            {(["all", "sessions", "checkins"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-lg px-4 py-1.5 font-sans text-xs font-medium transition-all",
                  activeTab === tab ? "bg-white text-[#3D5A54] shadow-sm" : "text-[#3D5A54]/50 hover:text-[#3D5A54]"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#B8D4C0] py-12 text-center font-sans text-sm text-[#3D5A54]/40">
            No events in this view yet. Complete a check-in or attend a session to see your timeline.
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, i) => (
              <Card
                key={item.id}
                className={cn(
                  "animate-reveal-up border-l-4 transition-all hover:scale-[1.01]",
                  item.status === "future"
                    ? "border-l-[#7BA89A] bg-[#FAFCFA]"
                    : item.status === "missed"
                      ? "border-l-[#B03030]/30 grayscale-[0.8]"
                      : "border-l-[#E8F2EE]"
                )}
                padding="md"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex gap-5">
                  <div className="flex min-w-[72px] flex-col items-center pt-1">
                    <span className="font-serif text-sm text-[#3D5A54]">{item.dateLabel}</span>
                    <span className="font-sans text-[10px] text-[#3D5A54]/30">{item.timeLabel}</span>
                  </div>
                  <div className="h-12 w-px bg-[#E8F2EE]" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-sm font-semibold text-[#3D5A54]">{item.label}</h3>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 font-sans text-[10px]",
                            item.type === "session" ? "border-[#B8D4C0] bg-[#E8F2EE] text-[#3D5A54]" : "border-[#E8F2EE] bg-[#F5F3EF] text-[#3D5A54]/60"
                          )}
                        >
                          {item.type === "session" ? "Session" : "Check-in"}
                        </span>
                      </div>
                      {item.status === "future" && (
                        <Link href="/dashboard/appointments">
                          <Button variant="ghost" size="sm" className="h-auto py-1 text-xs">
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-[#3D5A54]/70">{item.detail}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border",
                      item.status === "done"
                        ? "border-transparent bg-[#7BA89A] text-white"
                        : item.status === "missed"
                          ? "border-[#F5B8B8] bg-[#FDEAEA] text-[#B03030]"
                          : "border-[#E8F2EE] bg-white text-[#7BA89A]"
                    )}
                  >
                    {item.status === "done" ? "✓" : item.status === "future" ? "◎" : "✕"}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="animate-fade-up border-t border-[#E8F2EE] pt-8 text-center">
        <p className="font-serif text-xl text-[#3D5A54]">Questions, {firstName}?</p>
        <p className="mt-1 font-sans text-sm text-[#3D5A54]/50">Your counselor is part of your care team.</p>
        <Link href="/dashboard/chat" className="mt-6 inline-block">
          <Button size="lg" className="rounded-full px-10 shadow-lg shadow-[#7BA89A]/10">
            Open messages
          </Button>
        </Link>
      </div>
    </div>
  );
}
