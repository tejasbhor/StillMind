"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import type { RiskLevel, TrendValue } from "@/lib/constants";

type Student = {
  id: string; studentId: string; initials: string;
  risk: RiskLevel; trend: TrendValue; cri: number;
  lastSession: string; priorityScore: number;
  reasons: string[];
};

type Filter = "ALL" | "RED" | "YELLOW";

export default function PriorityQueuePage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await api.get<any>("/counselors/me/dashboard/priority-queue");
        setStudents(response.data);
      } catch (err: any) {
        console.error("Failed to fetch priority queue", err);
        setError(err?.message || "Failed to load priority queue");
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const filtered = filter === "ALL"
    ? students
    : students.filter((s) => s.risk === filter);

  if (loading) return <LoadingState text="Loading priority queue..." className="min-h-[50vh]" />;
  if (error) return <ErrorState title="Unable to load queue" message={error} onRetry={() => window.location.reload()} className="min-h-[50vh]" />;
  if (students.length === 0) return <EmptyState title="No students in queue" description="Students will appear here once assigned to you." className="min-h-[50vh]" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">Priority queue</h1>
          <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
            Sorted by risk level, then priority score. RED cases appear first.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white border border-[#E8F2EE] p-1">
          {(["ALL", "RED", "YELLOW"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg font-sans text-sm transition-all cursor-none",
                filter === f
                  ? "bg-[#3D5A54] text-white"
                  : "text-[#3D5A54]/50 hover:text-[#3D5A54]"
              )}
            >
              {f === "ALL" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 animate-fade-up stagger-1">
        {filtered.length === 0 ? (
          <p className="text-center font-sans text-sm text-[#3D5A54]/40 py-12 bg-white rounded-2xl border border-dashed border-[#B8D4C0]">
            No students currently in the queue for this category.
          </p>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "relative rounded-[16px] border transition-all duration-200 overflow-hidden",
                s.risk === "RED"
                  ? "border-[#F5B8B8] bg-white"
                  : "border-[#E8F2EE] bg-white hover:border-[#B8D4C0]",
              )}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* RED left border accent */}
              {s.risk === "RED" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B03030] opacity-70" />
              )}

              {/* Main row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                {/* Rank */}
                <span className="font-sans text-xs text-[#3D5A54]/30 w-6 flex-shrink-0 text-center">#{i + 1}</span>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-sans text-sm font-medium"
                  style={{
                    background: s.risk === "RED" ? "#FDEAEA" : s.risk === "YELLOW" ? "#FEF4E0" : "#E8F2EE",
                    color: s.risk === "RED" ? "#B03030" : s.risk === "YELLOW" ? "#A0700A" : "#3D5A54",
                  }}
                >
                  {s.initials}
                </div>

                {/* Student ID */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">{s.studentId}</p>
                  <p className="font-sans text-xs text-[#3D5A54]/40">Last session: {s.lastSession}</p>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-2">
                  <RiskBadge level={s.risk} size="sm" clinical pulse={s.risk === "RED"} />
                  <TrendIndicator trend={s.trend} size="sm" />
                </div>

                {/* CRI */}
                <div className="text-right flex-shrink-0">
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">{s.cri.toFixed(2)}</p>
                  <p className="font-sans text-[10px] text-[#3D5A54]/30">CRI</p>
                </div>

                {/* Priority score */}
                <div className="text-right flex-shrink-0">
                  <p className="font-sans text-sm font-medium text-[#7BA89A]">{s.priorityScore.toFixed(2)}</p>
                  <p className="font-sans text-[10px] text-[#3D5A54]/30">Priority</p>
                </div>

                {/* Expand chevron */}
                <span className={cn("text-[#3D5A54]/30 transition-transform duration-200", expanded === s.id && "rotate-180")}>
                  ↓
                </span>
              </div>

              {/* Expanded: explainability */}
              {expanded === s.id && (
                <div className="border-t border-[#E8F2EE] px-4 py-4 bg-[#FAFCFA] animate-fade-up">
                  <p className="font-sans text-xs font-medium text-[#3D5A54]/50 mb-3 tracking-wider uppercase">
                    Why this classification
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {s.reasons.length === 0 ? (
                      <span className="font-sans text-xs text-[#3D5A54]/40 italic">No specific reasons logged.</span>
                    ) : (
                      s.reasons.map((r, ri) => (
                        <span
                          key={ri}
                          className="rounded-full border border-[#E8F2EE] bg-white px-3 py-1 font-sans text-xs text-[#3D5A54]"
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/counselor/students/${s.id}`}>
                      <Button size="sm" id={`view-case-${s.studentId}`}>View full case</Button>
                    </Link>
                    <Button size="sm" variant="ghost" id={`override-${s.studentId}`}>Override priority</Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
