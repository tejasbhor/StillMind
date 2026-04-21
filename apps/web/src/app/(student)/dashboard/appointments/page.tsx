"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Dialog";
import { cn } from "@/utils/cn";
import { studentApi, api } from "@/services/api";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

type AllocStatus =
  | "ASSIGNED"
  | "CONFIRMED"
  | "DECLINED"
  | "RESCHEDULING"
  | "PENDING_RANKING"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED"
  | "EXPIRED";

type CurrentAllocation = {
  id: string;
  counselor_name: string;
  status: AllocStatus;
  slot_time: string | null;
  created_at: string;
  reason_summary?: string | null;
};

type SessionRow = {
  session_id: string;
  allocation_id: string;
  counselor_name: string;
  session_date: string | null;
  status: string;
  created_at: string;
};

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  ASSIGNED: { label: "Awaiting confirmation", cls: "bg-[#FEF4E0] text-[#A0700A] border-[#D4A017] font-semibold" },
  CONFIRMED: { label: "Confirmed", cls: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" },
  COMPLETED: { label: "Completed", cls: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" },
  MISSED: { label: "Missed", cls: "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]" },
  DECLINED: { label: "Declined", cls: "bg-[#FAFAFA] text-[#3D5A54]/50 border-[#E8F2EE]" },
  PENDING_RANKING: { label: "In priority queue", cls: "bg-[#E8EEF5] text-[#7F96B8] border-[#C4D4E8]" },
  RESCHEDULING: { label: "Reschedule requested", cls: "bg-[#E8EEF5] text-[#7F96B8] border-[#C4D4E8]" },
  CANCELLED: { label: "Cancelled", cls: "bg-[#FAFAFA] text-[#3D5A54]/50 border-[#E8F2EE]" },
  EXPIRED: { label: "Expired", cls: "bg-[#FAFAFA] text-[#3D5A54]/50 border-[#E8F2EE]" },
};

function formatSlot(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "—" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

function formatSessionWhen(row: SessionRow): { date: string; time: string } {
  const iso = row.session_date || row.created_at;
  return formatSlot(iso);
}

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<CurrentAllocation | null>(null);
  const [pastSessions, setPastSessions] = useState<SessionRow[]>([]);
  const [status, setStatus] = useState<AllocStatus | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [allocRes, sessRes] = await Promise.all([
        studentApi.getAllocation(),
        studentApi.getSessions(50, 0),
      ]);
      const raw = allocRes as { data?: CurrentAllocation | null };
      const alloc = raw?.data ?? null;
      setCurrent(alloc);
      setStatus(alloc?.status ?? null);
      const sRaw = sessRes as { data?: SessionRow[] };
      const all = Array.isArray(sRaw?.data) ? sRaw.data : [];
      setPastSessions(
        all.filter((s) => ["COMPLETED", "MISSED", "CANCELLED"].includes(s.status))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const handleConfirm = async () => {
    if (!current?.id) return;
    setActionLoading(true);
    try {
      await api.post("/students/me/allocation/confirm", { idempotency_key: current.id });
      setStatus("CONFIRMED");
      setShowConfirm(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!current?.id) return;
    setActionLoading(true);
    try {
      await api.post("/students/me/allocation/decline", { idempotency_key: current.id });
      setStatus("DECLINED");
      setShowDecline(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!current?.id) return;
    setActionLoading(true);
    try {
      await api.post("/students/me/allocation/reschedule", { idempotency_key: current.id });
      setStatus("RESCHEDULING");
      setShowReschedule(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading appointments…" className="min-h-[50vh]" />;
  }

  if (error) {
    return <ErrorState title="Unable to load appointments" message={error} onRetry={() => void load()} className="min-h-[50vh]" />;
  }

  const displayStatus = status ?? current?.status ?? "ASSIGNED";
  const chip = STATUS_CHIP[displayStatus] ?? STATUS_CHIP.ASSIGNED;
  const slot = formatSlot(current?.slot_time ?? null);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl font-semibold text-[#1C3530]">Appointments</h1>
        <p className="font-sans font-normal text-sm text-[#4A5E5A] mt-1">Manage your counselling sessions.</p>
      </div>

      {!current ? (
        <EmptyState
          title="No upcoming session"
          description="When a counsellor assigns you a slot, it will appear here."
          className="min-h-[30vh]"
        />
      ) : (
        <Card className="animate-fade-up stagger-1" padding="lg">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <p className="font-sans text-[11px] font-semibold tracking-[1.5px] uppercase text-[#7BA89A]">Upcoming session</p>
            <span className={cn("text-xs font-sans font-medium rounded-full px-3 py-1 border", chip.cls)}>{chip.label}</span>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#1C3530]">{current.counselor_name}</h2>
            {current.reason_summary ? (
              <p className="font-sans text-sm text-[#4A5E5A]">{current.reason_summary}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: "Date", value: slot.date },
                { label: "Time", value: slot.time },
                { label: "Duration", value: "30 minutes (typical)" },
                { label: "Location", value: "As arranged by your counsellor" },
              ].map((d) => (
                <div key={d.label} className="flex flex-col gap-0.5">
                  <p className="font-sans text-[11px] font-semibold text-[#7BA89A]">{d.label}</p>
                  <p className="font-sans text-sm font-medium text-[#1C3530]">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {displayStatus === "ASSIGNED" && (
            <div className="rounded-xl bg-[#FEF3CD] border border-transparent border-l-[3px] border-l-[#D4A017] px-4 py-3 mb-5">
              <p className="font-sans text-xs font-medium text-[#7A5200]">
                Please confirm your session so your counsellor can plan accordingly.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {(displayStatus === "ASSIGNED" || displayStatus === "PENDING_RANKING") && (
              <Button id="btn-confirm" onClick={() => setShowConfirm(true)} size="md" className="flex-1 sm:flex-none">
                Confirm session
              </Button>
            )}
            {displayStatus === "CONFIRMED" && (
              <div className="flex items-center gap-2 text-[#7BA89A]">
                <span className="animate-tick inline-block">✓</span>
                <span className="font-sans text-sm">Session confirmed</span>
              </div>
            )}
            {(displayStatus === "ASSIGNED" || displayStatus === "CONFIRMED") && (
              <Button id="btn-reschedule" variant="ghost" size="md" onClick={() => setShowReschedule(true)} className="border-[#3D5A54] text-[#3D5A54] font-medium">
                Reschedule
              </Button>
            )}
            {displayStatus === "ASSIGNED" && (
              <Button id="btn-decline" variant="outline" size="md" onClick={() => setShowDecline(true)} className="border-[#3D5A54] text-[#3D5A54] font-medium bg-transparent hover:bg-[#F5F3EF]">
                Decline
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="animate-fade-up stagger-2">
        <h2 className="font-serif text-xl text-[#3D5A54] mb-4">Past sessions</h2>
        {pastSessions.length === 0 ? (
          <p className="font-sans text-sm text-[#3D5A54]/50">No completed sessions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pastSessions.map((p) => {
              const when = formatSessionWhen(p);
              const st = STATUS_CHIP[p.status] ?? { label: p.status, cls: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" };
              return (
                <Card key={p.session_id} padding="sm" className="flex items-center gap-4">
                  <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", p.status === "COMPLETED" ? "bg-[#7BA89A]" : "bg-[#B03030]")} />
                  <div className="flex-1">
                    <p className="font-sans text-sm text-[#3D5A54]">
                      {when.date} · {when.time}
                    </p>
                    <p className="font-sans text-xs text-[#3D5A54]/40">{p.counselor_name}</p>
                  </div>
                  <span className={cn("text-xs font-sans rounded-full px-2.5 py-0.5 border", st.cls)}>{st.label}</span>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm your session">
        <p className="font-sans font-normal text-sm text-[#3D5A54]/80 mb-6 leading-relaxed">
          You&apos;re confirming your session with <strong className="font-medium text-[#3D5A54]">{current?.counselor_name}</strong> on{" "}
          <strong className="font-medium text-[#3D5A54]">{slot.date}</strong> at <strong className="font-medium text-[#3D5A54]">{slot.time}</strong>.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">
            Cancel
          </Button>
          <Button loading={actionLoading} onClick={() => void handleConfirm()} className="flex-1" id="modal-confirm">
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal open={showDecline} onClose={() => setShowDecline(false)} title="Decline this slot?">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-6 leading-relaxed">
          This slot will be released and may be offered to another student. You&apos;ll remain in the queue for the next available time.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowDecline(false)} className="flex-1">
            Go back
          </Button>
          <Button variant="danger" onClick={() => void handleDecline()} className="flex-1" id="modal-decline">
            Decline slot
          </Button>
        </div>
      </Modal>

      <Modal open={showReschedule} onClose={() => setShowReschedule(false)} title="Request a reschedule">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-6 leading-relaxed">
          Your counsellor will be notified. You may return to the priority queue until a new time is found.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowReschedule(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="amber" onClick={() => void handleReschedule()} className="flex-1" id="modal-reschedule">
            Request reschedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}
