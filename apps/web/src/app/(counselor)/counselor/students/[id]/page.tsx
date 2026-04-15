"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { MOOD_LABELS, KEY_CONCERNS, KEY_CONCERN_LABELS } from "@/lib/constants";
import type { MoodValue, TrendValue } from "@/lib/constants";

// ── Mock student data ──────────────────────────────────────────────────────────
const STUDENT = {
  id:          "STU-004",
  initials:    "RK",
  risk:        "RED" as const,
  cri:         0.81,
  trend:       "WORSENING" as TrendValue,
  reasons: [
    "High PHQ-9 score (22/27)",
    "Self-harm indicator: Q9 answered ≥ 1",
    "Poor sleep quality (score: 1/5)",
    "Worsening trend across last 3 check-ins",
    "Long gap since last session (12 days)",
  ],
  timeline: [
    { date: "3 Apr 2026",  type: "checkin", label: "Check-in submitted", risk: "RED",    trend: "WORSENING" },
    { date: "22 Mar 2026", type: "session", label: "Session completed",  risk: "YELLOW", note: "Discussed academic stress." },
    { date: "22 Mar 2026", type: "checkin", label: "Check-in submitted", risk: "YELLOW", trend: "STABLE" },
    { date: "8 Mar 2026",  type: "session", label: "Session missed",     risk: "YELLOW" },
    { date: "8 Mar 2026",  type: "checkin", label: "Check-in submitted", risk: "YELLOW", trend: "STABLE" },
  ],
};

// ── Session note form ──────────────────────────────────────────────────────────
function SessionNoteForm({ onClose }: { onClose: () => void }) {
  const [mood,       setMood]       = useState<MoodValue | null>(null);
  const [engagement, setEngagement] = useState<"LOW" | "MEDIUM" | "HIGH" | null>(null);
  const [concerns,   setConcerns]   = useState<string[]>([]);
  const [riskFlag,   setRiskFlag]   = useState<TrendValue | null>(null);
  const [actionPlan, setActionPlan] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  const toggleConcern = (c: string) =>
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const canSave = mood && engagement && riskFlag;

  return (
    <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Mood — face buttons */}
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Student mood</p>
        <div className="flex gap-3">
          {(["LOW", "NEUTRAL", "HIGH"] as MoodValue[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all cursor-none",
                mood === m
                  ? "border-[#7BA89A] bg-[#E8F2EE]"
                  : "border-[#E8F2EE] bg-white hover:border-[#B8D4C0]"
              )}
            >
              <span className="text-2xl">{MOOD_LABELS[m].emoji}</span>
              <span className="font-sans text-xs text-[#3D5A54]">{MOOD_LABELS[m].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Engagement */}
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Engagement level</p>
        <div className="flex gap-2">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEngagement(e)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border font-sans text-sm transition-all cursor-none",
                engagement === e
                  ? "border-[#7BA89A] bg-[#E8F2EE] text-[#3D5A54] font-medium"
                  : "border-[#E8F2EE] text-[#3D5A54]/50 hover:border-[#B8D4C0]"
              )}
            >
              {e.charAt(0) + e.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key concerns chip grid */}
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Key concerns discussed</p>
        <div className="flex flex-wrap gap-2">
          {KEY_CONCERNS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleConcern(c)}
              className={cn(
                "px-3 py-1.5 rounded-full border font-sans text-xs transition-all cursor-none",
                concerns.includes(c)
                  ? "border-[#7BA89A] bg-[#E8F2EE] text-[#3D5A54] font-medium"
                  : "border-[#E8F2EE] bg-white text-[#3D5A54]/60 hover:border-[#B8D4C0]"
              )}
            >
              {KEY_CONCERN_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Risk flag */}
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Risk trajectory</p>
        <div className="flex gap-2">
          {(["IMPROVING", "STABLE", "WORSENING"] as TrendValue[]).map((t) => {
            const colors = { IMPROVING: "#7BA89A", STABLE: "#7F96B8", WORSENING: "#B03030" };
            const bgs    = { IMPROVING: "#E8F2EE", STABLE: "#E8EEF5", WORSENING: "#FDEAEA" };
            return (
              <button
                key={t}
                type="button"
                onClick={() => setRiskFlag(t)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border font-sans text-xs transition-all cursor-none",
                  riskFlag === t ? "font-medium" : "border-[#E8F2EE] text-[#3D5A54]/50 bg-white hover:border-[#B8D4C0]"
                )}
                style={riskFlag === t ? { borderColor: colors[t], background: bgs[t], color: colors[t] } : {}}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action plan */}
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Action plan</p>
        <textarea
          value={actionPlan}
          onChange={(e) => setActionPlan(e.target.value)}
          rows={4}
          placeholder="Follow-up in 2 weeks / Escalate / Refer to psychiatry..."
          className="w-full rounded-xl border border-[#B8D4C0] bg-white px-4 py-3 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 resize-none focus:outline-none focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20 transition-all"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          loading={saving}
          disabled={!canSave}
          onClick={handleSave}
          className="flex-1"
          id="save-session-note"
        >
          {saved ? <span className="animate-tick">✓ Saved</span> : "Save note"}
        </Button>
      </div>
    </div>
  );
}

export default function StudentCasePage() {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [activeTab, setActiveTab]       = useState<"overview" | "timeline" | "assessments">("overview");
  const s = STUDENT;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-sans text-lg font-medium"
            style={{ background: "#FDEAEA", color: "#B03030" }}
          >
            {s.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl text-[#3D5A54]">{s.id}</h1>
              <RiskBadge level={s.risk} clinical pulse />
              <TrendIndicator trend={s.trend} />
            </div>
            <p className="font-sans text-sm text-[#3D5A54]/40 mt-0.5">
              CRI Score: <strong className="text-[#B03030]">{s.cri.toFixed(2)}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button id="log-note" onClick={() => setShowNoteForm(true)} size="sm">
            Log session note
          </Button>
          <Button id="override-priority" variant="ghost" size="sm" onClick={() => setShowOverride(true)}>
            Override
          </Button>
          <Button id="escalate" variant="danger" size="sm">
            Escalate
          </Button>
        </div>
      </div>

      {/* Explainability section */}
      <Card className="animate-fade-up stagger-1 border-[#F5B8B8] bg-[#FDEAEA]/30" padding="md">
        <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#B03030] mb-3">
          Why this classification
        </p>
        <div className="flex flex-wrap gap-2">
          {s.reasons.map((r, i) => (
            <span
              key={i}
              className="rounded-full border border-[#F5B8B8] bg-white px-3 py-1.5 font-sans text-xs text-[#3D5A54]"
            >
              {r}
            </span>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="animate-fade-up stagger-2 flex border border-[#E8F2EE] rounded-xl bg-white p-1 gap-1">
        {(["overview", "timeline", "assessments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 rounded-lg font-sans text-sm transition-all cursor-none capitalize",
              activeTab === tab
                ? "bg-[#3D5A54] text-white font-medium"
                : "text-[#3D5A54]/50 hover:text-[#3D5A54]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="animate-fade-up grid sm:grid-cols-2 gap-4">
          {[
            { label: "PHQ-9 Total",         value: "22 / 27", sub: "Severe",         color: "#B03030" },
            { label: "GAD-7 Total",         value: "16 / 21", sub: "Severe anxiety",  color: "#B03030" },
            { label: "Sleep quality",        value: "1 / 5",   sub: "Very poor",       color: "#A0700A" },
            { label: "Academic stress",      value: "5 / 5",   sub: "Overwhelming",    color: "#B03030" },
            { label: "Social isolation",     value: "HIGH",    sub: "Concerning",      color: "#A0700A" },
            { label: "Q9 flag",              value: "YES",     sub: "Self-harm indicator", color: "#B03030" },
          ].map((item) => (
            <Card key={item.label} padding="sm">
              <p className="font-sans text-xs text-[#3D5A54]/40">{item.label}</p>
              <p className="font-serif text-xl mt-1" style={{ color: item.color }}>{item.value}</p>
              <p className="font-sans text-xs text-[#3D5A54]/40 mt-0.5">{item.sub}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="animate-fade-up flex flex-col gap-0 relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E8F2EE]" />
          {s.timeline.map((t, i) => (
            <div key={i} className="relative flex gap-5 pb-6">
              <div
                className={cn(
                  "relative z-10 w-10 h-10 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-sans",
                  t.risk === "RED"
                    ? "border-[#F5B8B8] bg-[#FDEAEA] text-[#B03030]"
                    : "border-[#B8D4C0] bg-[#E8F2EE] text-[#3D5A54]"
                )}
              >
                {t.type === "session" ? "◫" : "✎"}
              </div>
              <div className="flex flex-col gap-0.5 pt-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">{t.label}</p>
                  {/* @ts-ignore */}
                  {t.risk && <RiskBadge level={t.risk as any} size="sm" clinical />}
                  {/* @ts-ignore */}
                  {t.trend && <TrendIndicator trend={t.trend as any} size="sm" showLabel={false} />}
                </div>
                {/* @ts-ignore */}
                {t.note && <p className="font-sans text-xs text-[#3D5A54]/55">{t.note}</p>}
                <p className="font-sans text-xs text-[#3D5A54]/30 mt-1">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "assessments" && (
        <Card className="animate-fade-up" padding="md">
          <p className="font-sans text-sm text-[#3D5A54]/60 font-light">
            Full assessment history for clinical review. This data is only visible to assigned counsellors.
          </p>
          <div className="mt-4 rounded-xl bg-[#F9FAFB] border border-[#E8F2EE] p-4">
            <pre className="font-mono text-xs text-[#3D5A54]/70 overflow-x-auto">{JSON.stringify({
              assessment_type: "PERIODIC",
              phq9_scores: { q1:2,q2:3,q3:2,q4:3,q5:2,q6:2,q7:3,q8:2,q9:3 },
              phq9_total: 22,
              gad7_scores: { q1:3,q2:3,q3:2,q4:3,q5:2,q6:1,q7:2 },
              gad7_total: 16,
              sleep_score: 1,
              academic_stress_score: 5,
              social_isolation_level: "HIGH",
              created_at: "2026-04-03T08:22:00Z"
            }, null, 2)}</pre>
          </div>
        </Card>
      )}

      {/* Session note modal */}
      <Modal open={showNoteForm} onClose={() => setShowNoteForm(false)} title="Log session note" size="lg">
        <SessionNoteForm onClose={() => setShowNoteForm(false)} />
      </Modal>

      {/* Override modal */}
      <Modal open={showOverride} onClose={() => setShowOverride(false)} title="Override priority">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-4 leading-relaxed">
          You're deviating from the system's recommendation. Please provide a reason — this will be logged to the audit trail.
        </p>
        <textarea
          rows={3}
          placeholder="e.g. Student contacted directly, situation stable, discussed in last session..."
          className="w-full rounded-xl border border-[#B8D4C0] bg-white px-4 py-3 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 resize-none focus:outline-none focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20 mb-4"
        />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowOverride(false)} className="flex-1">Cancel</Button>
          <Button variant="amber" onClick={() => setShowOverride(false)} className="flex-1" id="confirm-override">Log override</Button>
        </div>
      </Modal>
    </div>
  );
}
