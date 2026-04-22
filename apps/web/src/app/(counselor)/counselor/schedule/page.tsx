"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import RiskBadge from "@/components/shared/RiskBadge";
import { cn } from "@/utils/cn";
import { counselorApi } from "@/services/api";
import type { RiskLevel } from "@/utils/constants";

export default function CounselorSchedulePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchSessions = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await counselorApi.getSessions(dateStr);
      setSessions(response.data);
    } catch (err: any) {
      console.error("Failed to fetch sessions", err);
      setError(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(selectedDate);
  }, [selectedDate]);

  const updateStatus = async (id: string, status: string) => {
    try {
      if (status === "MISSED") {
        await counselorApi.markNoShow(id);
      }
      // Refresh after update
      fetchSessions(selectedDate);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="animate-fade-up flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">My Schedule</h1>
          <p className="font-sans font-normal text-sm text-[#3D5A54]/60 mt-1">
            {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {sessions.length} sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>Previous Day</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>Next Day</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Schedule List */}
        <div className="lg:col-span-2 flex flex-col gap-4 animate-fade-up stagger-1">
          {loading ? (
            <LoadingState text="Fetching your schedule..." className="min-h-[300px]" />
          ) : error ? (
            <ErrorState title="Schedule Error" message={error} onRetry={() => fetchSessions(selectedDate)} />
          ) : sessions.length === 0 ? (
            <Card padding="lg" className="text-center py-12 border-dashed border-[#B8D4C0]">
              <p className="font-sans text-sm text-[#3D5A54]/40">No sessions scheduled for this day.</p>
            </Card>
          ) : (
            sessions.map((s) => (
              <Card
                key={s.session_id}
                className={cn(
                  "transition-all border-l-4",
                  s.status === "MISSED" ? "opacity-60 grayscale border-l-[#B03030]/30" : 
                  s.status === "COMPLETED" ? "border-l-[#7BA89A]" : "border-l-[#D4900A]"
                )}
                padding="none"
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center min-w-[70px]">
                      <span className="font-serif text-xl text-[#3D5A54]">
                        {new Date(s.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-sans text-[10px] text-[#3D5A54]/40">30 min</span>
                    </div>
                    
                    <div className="w-px h-10 bg-[#E8F2EE]" />

                    <div>
                      <h3 className="font-sans text-sm font-medium text-[#3D5A54]">{s.student_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <RiskBadge level={s.risk_level as RiskLevel} size="sm" clinical />
                        <span className="font-sans text-[10px] text-[#3D5A54]/20">·</span>
                        <span className={cn(
                          "font-sans text-[10px] px-2 py-0.5 rounded-full border",
                          s.status === "COMPLETED" ? "bg-[#E8F2EE] border-[#B8D4C0] text-[#3D5A54]" :
                          s.status === "MISSED" ? "bg-[#FDEAEA] border-[#F5B8B8] text-[#B03030]" :
                          "bg-[#FEF4E0] border-[#E8D4B0] text-[#A0700A]"
                        )}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {s.status !== "COMPLETED" && s.status !== "MISSED" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(s.session_id, "MISSED")}>Mark No-show</Button>
                        <Link href={`/counselor/students/${s.student_id}`}>
                          <Button size="sm">Open Case</Button>
                        </Link>
                      </>
                    )}
                    {s.status === "COMPLETED" && (
                      <Link href={`/counselor/students/${s.student_id}`}>
                        <Button size="sm" variant="outline">View Summary</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Calendar / Quick Stats Sidebar */}
        <div className="flex flex-col gap-6 animate-fade-up stagger-2">
          <Card padding="md">
            <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Daily Context</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Total Sessions</span>
                <span className="font-sans text-[#3D5A54] font-medium">{sessions.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Completed</span>
                <span className="font-sans text-[#3D5A54] font-medium">
                  {sessions.filter(s => s.status === 'COMPLETED').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Pending</span>
                <span className="font-sans text-[#3D5A54] font-medium">
                  {sessions.filter(s => s.status !== 'COMPLETED' && s.status !== 'MISSED').length}
                </span>
              </div>
              <div className="h-px bg-[#E8F2EE] my-1" />
              <Link href="/counselor/capacity">
                <Button variant="ghost" className="w-full text-xs">Manage Capacity</Button>
              </Link>
            </div>
          </Card>

          <Card padding="md" className="bg-[#3D5A54] text-white border-none">
            <h2 className="font-serif text-lg mb-2">Institutional Guideline</h2>
            <p className="font-sans text-xs font-normal opacity-80 leading-relaxed">
              Prioritize RED cases even if they are not in today's schedule. Use the Priority Queue to check for high-risk flags throughout the day.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

