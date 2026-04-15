"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import { cn } from "@/lib/cn";
import type { RiskLevel, TrendValue } from "@/lib/constants";

type Student = {
  id: string; studentId: string; initials: string;
  risk: RiskLevel; trend: TrendValue; cri: number;
  lastSession: string; priorityScore: number;
  reasons: string[];
};

const ALL_STUDENTS: Student[] = [
  { id: "q1", studentId: "STU-004", initials: "RK", risk: "RED",    trend: "WORSENING", cri: 0.81, lastSession: "12d ago", priorityScore: 0.93, reasons: ["High PHQ-9 score (22/27)", "Self-harm indicator: Q9 answered ≥ 1", "Poor sleep quality (1/5)", "Worsening trend"] },
  { id: "q2", studentId: "STU-005", initials: "AM", risk: "RED",    trend: "STABLE",    cri: 0.74, lastSession: "7d ago",  priorityScore: 0.79, reasons: ["High PHQ-9 score (18/27)", "High academic stress (5/5)", "Poor sleep (2/5)"] },
  { id: "q3", studentId: "STU-007", initials: "PG", risk: "YELLOW", trend: "WORSENING", cri: 0.52, lastSession: "21d ago", priorityScore: 0.71, reasons: ["Elevated GAD-7 score (14/21)", "High academic stress (5/5)", "Long gap since last session"] },
  { id: "q4", studentId: "STU-011", initials: "NJ", risk: "YELLOW", trend: "STABLE",    cri: 0.41, lastSession: "14d ago", priorityScore: 0.55, reasons: ["Elevated PHQ-9 (11/27)", "Moderate sleep issues (2/5)"] },
  { id: "q5", studentId: "STU-013", initials: "SV", risk: "YELLOW", trend: "IMPROVING", cri: 0.38, lastSession: "10d ago", priorityScore: 0.42, reasons: ["Elevated GAD-7 (10/21)", "Social isolation: MEDIUM"] },
  { id: "q6", studentId: "STU-018", initials: "KP", risk: "YELLOW", trend: "STABLE",    cri: 0.33, lastSession: "5d ago",  priorityScore: 0.38, reasons: ["Moderate PHQ-9 (10/27)"] },
];

type Filter = "ALL" | "RED" | "YELLOW";

export default function PriorityQueuePage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "ALL"
    ? ALL_STUDENTS
    : ALL_STUDENTS.filter((s) => s.risk === filter);

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
        {filtered.map((s, i) => (
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
                  {s.reasons.map((r, ri) => (
                    <span
                      key={ri}
                      className="rounded-full border border-[#E8F2EE] bg-white px-3 py-1 font-sans text-xs text-[#3D5A54]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/counselor/students/${s.studentId}`}>
                    <Button size="sm" id={`view-case-${s.studentId}`}>View full case</Button>
                  </Link>
                  <Button size="sm" variant="ghost" id={`override-${s.studentId}`}>Override priority</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
