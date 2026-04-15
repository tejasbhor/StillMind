"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

const MOCK_APPOINTMENT = {
  id: "apl-001",
  counselor: "Dr. Priya Menon",
  specialty: "Cognitive Behavioural Therapy",
  date: "Wednesday, 16 April 2026",
  time: "10:30 AM",
  duration: "30 minutes",
  location: "Room 204, Student Wellness Centre",
  status: "ASSIGNED" as const,
  canReschedule: true,
  reschedulesUsed: 0,
};

const PAST = [
  { id: "p1", date: "2 April 2026", time: "11:00 AM", counselor: "Dr. Priya Menon", status: "COMPLETED" },
  { id: "p2", date: "18 March 2026", time: "10:00 AM", counselor: "Dr. Priya Menon", status: "COMPLETED" },
  { id: "p3", date: "4 March 2026", time: "2:00 PM",  counselor: "Dr. Priya Menon", status: "MISSED" },
];

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  ASSIGNED:   { label: "Awaiting confirmation", cls: "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]" },
  CONFIRMED:  { label: "Confirmed",              cls: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" },
  COMPLETED:  { label: "Completed",              cls: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" },
  MISSED:     { label: "Missed",                 cls: "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]" },
  PENDING_RANKING: { label: "In priority queue", cls: "bg-[#E8EEF5] text-[#7F96B8] border-[#C4D4E8]" },
};

export default function AppointmentsPage() {
  const [showConfirm, setShowConfirm]     = useState(false);
  const [showDecline, setShowDecline]     = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [confirmed, setConfirmed]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const apt = MOCK_APPOINTMENT;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setConfirmed(true);
    setLoading(false);
    setShowConfirm(false);
  };

  const status = confirmed ? "CONFIRMED" : apt.status;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Appointments</h1>
        <p className="font-sans font-light text-sm text-[#3D5A54]/55 mt-1">
          Manage your counselling sessions.
        </p>
      </div>

      {/* Current appointment */}
      <Card className="animate-fade-up stagger-1" padding="lg">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">
            Upcoming session
          </p>
          <span className={cn("text-xs font-sans font-medium rounded-full px-3 py-1 border", STATUS_CHIP[status].cls)}>
            {STATUS_CHIP[status].label}
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <h2 className="font-serif text-2xl text-[#3D5A54]">{apt.counselor}</h2>
          <p className="font-sans text-sm text-[#3D5A54]/55">{apt.specialty}</p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { icon: "◫", label: "Date",     value: apt.date },
              { icon: "◷", label: "Time",     value: apt.time },
              { icon: "◑", label: "Duration", value: apt.duration },
              { icon: "⌖", label: "Location", value: apt.location },
            ].map((d) => (
              <div key={d.label} className="flex flex-col gap-0.5">
                <p className="font-sans text-xs text-[#3D5A54]/40">{d.label}</p>
                <p className="font-sans text-sm text-[#3D5A54] font-medium">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {!confirmed && (
          <div className="rounded-xl bg-[#FEF4E0] border border-[#E8D4B0] px-4 py-3 mb-5">
            <p className="font-sans text-xs text-[#A0700A]">
              Please confirm by this evening. Unconfirmed slots are released 12 hours before the session.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!confirmed && (
            <Button id="btn-confirm" onClick={() => setShowConfirm(true)} size="md" className="flex-1 sm:flex-none">
              Confirm session
            </Button>
          )}
          {confirmed && (
            <div className="flex items-center gap-2 text-[#7BA89A]">
              <span className="animate-tick inline-block">✓</span>
              <span className="font-sans text-sm">Session confirmed</span>
            </div>
          )}
          {apt.canReschedule && apt.reschedulesUsed < 1 && (
            <Button id="btn-reschedule" variant="ghost" size="md" onClick={() => setShowReschedule(true)}>
              Reschedule
            </Button>
          )}
          <Button id="btn-decline" variant="outline" size="md" onClick={() => setShowDecline(true)}>
            Decline
          </Button>
        </div>
      </Card>

      {/* Past sessions */}
      <div className="animate-fade-up stagger-2">
        <h2 className="font-serif text-xl text-[#3D5A54] mb-4">Past sessions</h2>
        <div className="flex flex-col gap-3">
          {PAST.map((p) => (
            <Card key={p.id} padding="sm" className="flex items-center gap-4">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0",
                  p.status === "COMPLETED" ? "bg-[#7BA89A]" : "bg-[#B03030]"
                )}
              />
              <div className="flex-1">
                <p className="font-sans text-sm text-[#3D5A54]">{p.date} · {p.time}</p>
                <p className="font-sans text-xs text-[#3D5A54]/40">{p.counselor}</p>
              </div>
              <span className={cn("text-xs font-sans rounded-full px-2.5 py-0.5 border", STATUS_CHIP[p.status].cls)}>
                {STATUS_CHIP[p.status].label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm your session">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-6 leading-relaxed">
          You're confirming your session with <strong className="font-medium text-[#3D5A54]">{apt.counselor}</strong> on{" "}
          <strong className="font-medium text-[#3D5A54]">{apt.date}</strong> at{" "}
          <strong className="font-medium text-[#3D5A54]">{apt.time}</strong>.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">Cancel</Button>
          <Button loading={loading} onClick={handleConfirm} className="flex-1" id="modal-confirm">Confirm</Button>
        </div>
      </Modal>

      {/* Decline modal */}
      <Modal open={showDecline} onClose={() => setShowDecline(false)} title="Decline this slot?">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-6 leading-relaxed">
          This slot will be released and may be offered to another student. You'll remain in the queue for the next available time.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowDecline(false)} className="flex-1">Go back</Button>
          <Button variant="danger" onClick={() => setShowDecline(false)} className="flex-1" id="modal-decline">Decline slot</Button>
        </div>
      </Modal>

      {/* Reschedule modal */}
      <Modal open={showReschedule} onClose={() => setShowReschedule(false)} title="Request a reschedule">
        <p className="font-sans font-light text-sm text-[#3D5A54]/70 mb-6 leading-relaxed">
          You have <strong className="text-[#3D5A54]">1 reschedule</strong> available this cycle. Your counsellor will be notified and a new slot will be found.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowReschedule(false)} className="flex-1">Cancel</Button>
          <Button variant="amber" onClick={() => setShowReschedule(false)} className="flex-1" id="modal-reschedule">Request reschedule</Button>
        </div>
      </Modal>
    </div>
  );
}
