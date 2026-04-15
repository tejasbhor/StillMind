"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Mock schedule data aligned with API contract
const SESSIONS = [
  {
    id: "ses_1",
    studentId: "stu_1",
    studentName: "Alex Johnson",
    time: "10:00 AM",
    duration: "30 min",
    status: "CONFIRMED",
    risk: "YELLOW",
  },
  {
    id: "ses_2",
    studentId: "stu_2",
    studentName: "Rohan Kapoor",
    time: "11:30 AM",
    duration: "30 min",
    status: "SCHEDULED",
    risk: "RED",
  },
  {
    id: "ses_3",
    studentId: "stu_4",
    studentName: "Meera Das",
    time: "02:00 PM",
    duration: "30 min",
    status: "CONFIRMED",
    risk: "GREEN",
  },
  {
    id: "ses_4",
    studentId: "stu_5",
    studentName: "Karan Singh",
    time: "03:30 PM",
    duration: "30 min",
    status: "MISSED",
    risk: "YELLOW",
  },
];

export default function CounselorSchedulePage() {
  const [sessions, setSessions] = useState(SESSIONS);
  const [selectedDate, setSelectedDate] = useState("Wednesday, 16 April 2026");

  const updateStatus = (id: string, status: any) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handlePrevDay = () => {
    setSelectedDate("Tuesday, 15 April 2026");
    setSessions([]);
  };

  const handleNextDay = () => {
    setSelectedDate("Thursday, 17 April 2026");
    setSessions([]);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="animate-fade-up flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">My Schedule</h1>
          <p className="font-sans font-normal text-sm text-[#3D5A54]/60 mt-1">
            {selectedDate} · 4 sessions total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>Previous Day</Button>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>Next Day</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Schedule List */}
        <div className="lg:col-span-2 flex flex-col gap-4 animate-fade-up stagger-1">
          {sessions.map((s) => (
            <Card
              key={s.id}
              className={cn(
                "transition-all border-l-4",
                s.status === "MISSED" ? "opacity-60 grayscale border-l-[#B03030]/30" : 
                s.status === "CONFIRMED" ? "border-l-[#7BA89A]" : "border-l-[#D4900A]"
              )}
              padding="none"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <span className="font-serif text-xl text-[#3D5A54]">{s.time}</span>
                    <span className="font-sans text-[10px] text-[#3D5A54]/40">{s.duration}</span>
                  </div>
                  
                  <div className="w-px h-10 bg-[#E8F2EE]" />

                  <div>
                    <h3 className="font-sans text-sm font-medium text-[#3D5A54]">{s.studentName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "font-sans text-[10px] flex items-center gap-1.5",
                        s.risk === "RED" ? "text-[#B03030]" : 
                        s.risk === "YELLOW" ? "text-[#D4900A]" : "text-[#7BA89A]"
                      )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {s.risk} Risk
                      </span>
                      <span className="font-sans text-[10px] text-[#3D5A54]/20">·</span>
                      <span className={cn(
                        "font-sans text-[10px] px-2 py-0.5 rounded-full border",
                        s.status === "CONFIRMED" ? "bg-[#E8F2EE] border-[#B8D4C0] text-[#3D5A54]" :
                        s.status === "MISSED" ? "bg-[#FDEAEA] border-[#F5B8B8] text-[#B03030]" :
                        "bg-[#FEF4E0] border-[#E8D4B0] text-[#A0700A]"
                      )}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {s.status === "SCHEDULED" && (
                    <Button size="sm" onClick={() => updateStatus(s.id, "CONFIRMED")}>Confirm</Button>
                  )}
                  {s.status === "CONFIRMED" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "MISSED")}>Mark No-show</Button>
                      <Link href={`/counselor/students/${s.studentId}`}>
                        <Button size="sm" id={`start-session-${s.id}`}>Start Session</Button>
                      </Link>
                    </>
                  )}
                  {s.status === "MISSED" && (
                    <Button variant="ghost" size="sm" className="text-xs">Schedule Follow-up</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Calendar / Quick Stats Sidebar */}
        <div className="flex flex-col gap-6 animate-fade-up stagger-2">
          <Card padding="md">
            <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Availability</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Working Hours</span>
                <span className="font-sans text-[#3D5A54] font-medium">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Total Slots</span>
                <span className="font-sans text-[#3D5A54] font-medium">10</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[#3D5A54]/60">Booked</span>
                <span className="font-sans text-[#3D5A54] font-medium">6</span>
              </div>
              <div className="h-px bg-[#E8F2EE] my-1" />
              <Button variant="ghost" className="w-full text-xs">Configure Hours</Button>
            </div>
          </Card>

          <Card padding="md" className="bg-[#3D5A54] text-white border-none">
            <h2 className="font-serif text-lg mb-2">Note</h2>
            <p className="font-sans text-xs font-normal opacity-80 leading-relaxed">
              Assigned students are rank-ordered by the system. If you need to reschedule, please ensure the audit log reflects the clinical reasoning.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
