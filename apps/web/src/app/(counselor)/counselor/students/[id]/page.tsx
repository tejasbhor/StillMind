"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RiskBadge from "@/components/shared/RiskBadge";
import TrendIndicator from "@/components/shared/TrendIndicator";
import { Modal } from "@/components/ui/Dialog";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";
import { counselorApi } from "@/services/api";
import { MOOD_LABELS, KEY_CONCERNS, KEY_CONCERN_LABELS } from "@/utils/constants";
import type { MoodValue, TrendValue, RiskLevel } from "@/utils/constants";

// ── Session note form ──────────────────────────────────────────────────────────
function SessionNoteForm({ 
  studentId, 
  onClose, 
  onSuccess 
}: { 
  studentId: string, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [mood,       setMood]       = useState<MoodValue | null>(null);
  const [engagement, setEngagement] = useState<"LOW" | "MEDIUM" | "HIGH" | null>(null);
  const [concerns,   setConcerns]   = useState<string[]>([]);
  const [riskFlag,   setRiskFlag]   = useState<TrendValue | null>(null);
  const [actionPlan, setActionPlan] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  const toggleConcern = (c: string) =>
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const handleSave = async () => {
    if (!mood || !engagement || !riskFlag) return;
    setSaving(true);
    setError("");
    try {
      // Find the active session ID first (simplified for this demo, usually you'd pick from a list)
      const sessionsRes = await counselorApi.getSessions();
      const activeSession = sessionsRes.data.find((s: any) => s.student_id === studentId && s.status !== 'COMPLETED');
      
      if (!activeSession) {
        throw new Error("No active session found for this student. Please schedule one first.");
      }

      await counselorApi.logSessionNote(activeSession.session_id, {
        mood_observation: mood,
        engagement_level: engagement,
        key_concerns: concerns,
        clinical_summary: actionPlan || "Routine session check-in.",
        action_plan: [actionPlan]
      });

      // Also log outcome to complete the session
      await counselorApi.logOutcome(activeSession.session_id, {
        outcome_status: "COMPLETED",
        clinical_justification: "Session completed successfully.",
        risk_trajectory: riskFlag
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save session note");
    } finally {
      setSaving(false);
    }
  };

  const canSave = mood && engagement && riskFlag;

  return (
    <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Student mood</p>
        <div className="flex gap-3">
          {(["LOW", "NEUTRAL", "HIGH"] as MoodValue[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all cursor-pointer",
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

      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Engagement level</p>
        <div className="flex gap-2">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEngagement(e)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border font-sans text-sm transition-all cursor-pointer",
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

      <div>
        <p className="font-sans text-sm font-medium text-[#3D5A54] mb-3">Key concerns discussed</p>
        <div className="flex flex-wrap gap-2">
          {KEY_CONCERNS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleConcern(c)}
              className={cn(
                "px-3 py-1.5 rounded-full border font-sans text-xs transition-all cursor-pointer",
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
                  "flex-1 py-2.5 rounded-xl border font-sans text-xs transition-all cursor-pointer",
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

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          loading={saving}
          disabled={!canSave}
          onClick={handleSave}
          className="flex-1"
        >
          Save note
        </Button>
      </div>
    </div>
  );
}

export default function StudentCasePage() {
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [riskDetails, setRiskDetails] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "assessments">("overview");

  const fetchData = async () => {
    try {
      const [sumRes, riskRes, timeRes, assRes] = await Promise.all([
        counselorApi.getStudent(studentId),
        counselorApi.getStudentRisk(studentId),
        counselorApi.getStudentTimeline(studentId),
        counselorApi.getStudentAssessments(studentId)
      ]);
      setSummary(sumRes.data);
      setRiskDetails(riskRes.data);
      setTimeline(timeRes.data);
      setAssessments(assRes.data);
    } catch (err: any) {
      console.error("Failed to fetch student data", err);
      setError(err.message || "Failed to load student case");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  if (loading) return <LoadingState text="Fetching clinical case..." className="min-h-[60vh]" />;
  if (error) return <ErrorState title="Case Access Denied" message={error} onRetry={fetchData} className="min-h-[60vh]" />;
  if (!summary) return <EmptyState title="Case not found" description="This student record could not be retrieved." />;

  const s = summary;
  const r = riskDetails;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-sans text-lg font-medium"
            style={{ 
              background: s.current_risk_level === "RED" ? "#FDEAEA" : "#E8F2EE", 
              color: s.current_risk_level === "RED" ? "#B03030" : "#3D5A54" 
            }}
          >
            {s.student_name?.split(' ').map((n: string) => n[0]).join('') || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl text-[#3D5A54]">{s.college_id || s.student_id.slice(0, 8)}</h1>
              <RiskBadge level={s.current_risk_level as RiskLevel} clinical pulse={s.current_risk_level === "RED"} />
              <TrendIndicator trend={s.current_trend as TrendValue} />
            </div>
            <p className="font-sans text-sm text-[#3D5A54]/60 mt-0.5">
              CRI Score: <strong className={cn(s.current_risk_level === 'RED' ? 'text-[#B03030]' : 'text-[#3D5A54]')}>{s.cri_score.toFixed(2)}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNoteForm(true)} size="sm">Log session note</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowOverride(true)}>Override</Button>
        </div>
      </div>

      {/* Explainability section */}
      <Card className={cn("animate-fade-up stagger-1 border", s.current_risk_level === 'RED' ? 'border-[#F5B8B8] bg-[#FDEAEA]/30' : 'border-[#E8F2EE]')} padding="md">
        <p className={cn("font-sans text-xs font-medium tracking-widest uppercase mb-3", s.current_risk_level === 'RED' ? 'text-[#B03030]' : 'text-[#3D5A54]/60')}>
          Classification Reason
        </p>
        <div className="flex flex-wrap gap-2">
          {r?.reasons?.length > 0 ? r.reasons.map((reason: string, i: number) => (
            <span key={i} className="rounded-full border border-[#E8F2EE] bg-white px-3 py-1.5 font-sans text-xs text-[#3D5A54]">
              {reason}
            </span>
          )) : (
            <span className="font-sans text-xs text-[#3D5A54]/40 italic">No specific risk triggers identified.</span>
          )}
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
            { label: "Student Name", value: s.student_name, sub: "Full Profile", color: "#3D5A54" },
            { label: "Profile Status", value: s.profile_status, sub: "Account State", color: "#3D5A54" },
            { label: "Completed Sessions", value: s.session_count, sub: "Historical", color: "#7BA89A" },
            { label: "Allocation Status", value: s.allocation_status, sub: "Current Plan", color: "#7BA89A" },
            { label: "Engagement Flags", value: r?.engagement_flags?.length || 0, sub: "Potential concerns", color: r?.engagement_flags?.length > 0 ? "#B03030" : "#3D5A54" },
            { label: "Next Session", value: s.next_session_date ? new Date(s.next_session_date).toLocaleDateString() : 'None Scheduled', sub: "Upcoming", color: "#3D5A54" },
          ].map((item) => (
            <Card key={item.label} padding="sm">
              <p className="font-sans text-xs text-[#3D5A54]/60">{item.label}</p>
              <p className="font-serif text-xl mt-1" style={{ color: item.color }}>{item.value}</p>
              <p className="font-sans text-xs text-[#3D5A54]/60 mt-0.5">{item.sub}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="animate-fade-up flex flex-col gap-0 relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E8F2EE]" />
          {timeline.length === 0 ? (
            <p className="text-center font-sans text-sm text-[#3D5A54]/40 py-12">No activity recorded yet.</p>
          ) : (
            timeline.map((t, i) => (
              <div key={i} className="relative flex gap-5 pb-6">
                <div className={cn(
                  "relative z-10 w-10 h-10 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-sans",
                  t.data?.risk_level === "RED" ? "border-[#F5B8B8] bg-[#FDEAEA] text-[#B03030]" : "border-[#B8D4C0] bg-[#E8F2EE] text-[#3D5A54]"
                )}>
                  {t.type === "SESSION" ? "◫" : t.type === "ASSESSMENT" ? "✎" : "◎"}
                </div>
                <div className="flex flex-col gap-0.5 pt-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans text-sm font-medium text-[#3D5A54]">{t.type}</p>
                    {t.data?.risk_level && <RiskBadge level={t.data.risk_level} size="sm" clinical />}
                    {t.data?.status && <span className="text-[10px] px-1.5 py-0.5 bg-[#FAFAFA] border rounded uppercase">{t.data.status}</span>}
                  </div>
                  <p className="font-sans text-xs text-[#3D5A54]/55">
                    {t.type === 'SESSION' ? `Session ${t.data.status}` : 
                     t.type === 'RISK_UPDATE' ? `Risk shifted to ${t.data.risk_level} (CRI: ${t.data.cri_score.toFixed(2)})` :
                     `Completed ${t.data.assessment_type} assessment`}
                  </p>
                  <p className="font-sans text-xs text-[#3D5A54]/30 mt-1">{new Date(t.date).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "assessments" && (
        <div className="flex flex-col gap-4">
          {assessments.length === 0 ? (
            <Card padding="md" className="text-center py-12">
              <p className="font-sans text-sm text-[#3D5A54]/40">No clinical assessments found.</p>
            </Card>
          ) : (
            assessments.map((a) => (
              <Card key={a.assessment_id} padding="md" className="animate-fade-up">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-lg text-[#3D5A54]">{a.assessment_type} Assessment</h3>
                    <p className="font-sans text-xs text-[#3D5A54]/40">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-right">
                      <p className="font-serif text-lg text-[#B03030]">{a.phq9_total}</p>
                      <p className="font-sans text-[10px] uppercase text-[#3D5A54]/40">PHQ-9</p>
                    </div>
                    <div className="text-right border-l pl-3">
                      <p className="font-serif text-lg text-[#A0700A]">{a.gad7_total}</p>
                      <p className="font-sans text-[10px] uppercase text-[#3D5A54]/40">GAD-7</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-4">
                  <div>
                    <p className="text-[10px] text-[#3D5A54]/40 uppercase">Sleep</p>
                    <p className="text-sm font-medium">{a.sleep_score}/5</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3D5A54]/40 uppercase">Academic</p>
                    <p className="text-sm font-medium">{a.academic_stress_score}/5</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3D5A54]/40 uppercase">Social</p>
                    <p className="text-sm font-medium">{a.social_isolation_level}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3D5A54]/40 uppercase">Q9 Flag</p>
                    <p className={cn("text-sm font-bold", a.q9_flag ? "text-[#B03030]" : "text-green-600")}>
                      {a.q9_flag ? "YES" : "NO"}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Session note modal */}
      <Modal open={showNoteForm} onClose={() => setShowNoteForm(false)} title="Log session note" size="lg">
        <SessionNoteForm 
          studentId={studentId}
          onClose={() => setShowNoteForm(false)} 
          onSuccess={() => {
            setShowNoteForm(false);
            fetchData();
          }} 
        />
      </Modal>

      {/* Override modal - Placeholder for now as backend service exists but usually needs specific context */}
      <Modal open={showOverride} onClose={() => setShowOverride(false)} title="Override priority">
        <p className="font-sans font-normal text-sm text-[#3D5A54]/80 mb-4">
          This feature allows clinical overrides of the system's risk assessment.
        </p>
        <Button variant="outline" onClick={() => setShowOverride(false)} className="w-full">Close</Button>
      </Modal>
    </div>
  );
}
