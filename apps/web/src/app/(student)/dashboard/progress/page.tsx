"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const TIMELINE = [
  {
    id: "t1",
    date: "16 Apr 2026",
    type: "session",
    label: "Upcoming session",
    detail: "With Dr. Priya Menon",
    status: "future",
    time: "10:30 AM",
  },
  {
    id: "t2",
    date: "2 Apr 2026",
    type: "session",
    label: "Session completed",
    detail: "Discussed academic pressure and sleep routine.",
    status: "done",
    time: "11:00 AM",
  },
  {
    id: "t3",
    date: "2 Apr 2026",
    type: "checkin",
    label: "Check-in submitted",
    detail: "Moving steadily.",
    status: "done",
    time: "10:00 AM",
  },
  {
    id: "t4",
    date: "18 Mar 2026",
    type: "session",
    label: "Session completed",
    detail: "Explored coping strategies for exam period.",
    status: "done",
    time: "4:30 PM",
  },
  {
    id: "t5",
    date: "4 Mar 2026",
    type: "session",
    label: "Session missed",
    detail: "No attendance recorded.",
    status: "missed",
    time: "12:00 PM",
  },
  {
    id: "t6",
    date: "18 Feb 2026",
    type: "checkin",
    label: "Check-in submitted",
    detail: "Some support available.",
    status: "done",
    time: "9:15 AM",
  },
];

function WaveChart() {
  return (
    <div className="relative w-full h-32 overflow-hidden rounded-2xl bg-[#E8F2EE]/40 group transition-all duration-500 hover:bg-[#E8F2EE]/60">
      <svg
        viewBox="0 0 400 80"
        className="w-full h-full"
        preserveAspectRatio="none"
        aria-label="Wellbeing trend over time"
      >
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7BA89A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7BA89A" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Animated Background path */}
        <path
          d="M0,55 C40,52 80,62 120,58 C160,54 200,44 240,40 C280,36 320,38 360,34 C380,32 390,30 400,29 L400,80 L0,80Z"
          fill="url(#wave-grad)"
          className="transition-all duration-700"
        />
        
        {/* Main line */}
        <path
          d="M0,55 C40,52 80,62 120,58 C160,54 200,44 240,40 C280,36 320,38 360,34 C380,32 390,30 400,29"
          fill="none"
          stroke="#7BA89A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
        />

        {/* Interactive Data points */}
        {[
          { x: 0,   y: 55, date: "18 Feb" },
          { x: 80,  y: 62, date: "4 Mar" },
          { x: 160, y: 54, date: "18 Mar" },
          { x: 240, y: 40, date: "2 Apr" },
          { x: 320, y: 38, date: "9 Apr" },
          { x: 400, y: 29, date: "16 Apr" },
        ].map((pt, i) => (
          <g key={i} className="group/pt cursor-pointer">
            <circle 
                cx={pt.x} 
                cy={pt.y} 
                r="6" 
                fill="#7BA89A" 
                className="opacity-0 group-hover/pt:opacity-20 transition-opacity"
            />
            <circle 
                cx={pt.x} 
                cy={pt.y} 
                r="3.5" 
                fill="#3D5A54" 
                className="transition-all duration-300 group-hover/pt:r-5"
            />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E8F2EE]/10 to-transparent animate-shimmer" />
    </div>
  );
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"all" | "sessions" | "checkins">("all");

  const filteredTimeline = TIMELINE.filter(item => {
      if (activeTab === "all") return true;
      if (activeTab === "sessions") return item.type === "session";
      if (activeTab === "checkins") return item.type === "checkin";
      return true;
  });

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto pb-20">
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="font-serif text-[2.6rem] text-[#3D5A54] leading-tight">Your Journey</h1>
        <p className="font-sans font-normal text-base text-[#3D5A54]/60 mt-2">
            Tracking your progress is part of the healing. No grades, no judgment—only steps forward.
        </p>
      </div>

      {/* ── Counselor Insight (Conversational Interactivity) ─────────────── */}
      <div className="animate-fade-up stagger-1">
        <Card className="bg-[#3D5A54] border-none text-white relative overflow-hidden" padding="lg">
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7BA89A] flex items-center justify-center font-serif text-white">
                        PM
                    </div>
                    <div>
                        <p className="font-sans text-xs font-medium opacity-60 uppercase tracking-widest">Counselor's Insight</p>
                        <p className="font-sans text-sm font-medium">Dr. Priya Menon</p>
                    </div>
                </div>
                <p className="font-serif text-xl leading-relaxed italic">
                    "Alex, I'm noticing a positive trend in your engagement over the last two weeks. While academic stress is still present, your sleep routine is stabilizing nicely."
                </p>
                <div className="flex items-center gap-4 mt-2">
                    <Link href="/dashboard/chat">
                        <Button className="bg-[#7BA89A] hover:bg-[#6C9688] border-none text-sm px-6">
                            Ask about this
                        </Button>
                    </Link>
                    <span className="font-sans text-xs opacity-50 italic">Last updated 2 hours ago</span>
                </div>
            </div>
            {/* Decortative shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7BA89A]/10 rounded-full" />
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-[#E8F2EE]/5 rounded-full" />
        </Card>
      </div>

      {/* ── Progress Visualization ────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-2" padding="lg">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">Overall Vibe</p>
            <h2 className="font-serif text-3xl text-[#3D5A54] mt-1">Steady Improvement</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-[#E8F2EE] px-4 py-1.5 rounded-full border border-[#B8D4C0]">
                <span className="w-2 h-2 rounded-full bg-[#7BA89A] animate-pulse" />
                <span className="font-sans text-xs font-semibold text-[#3D5A54]">TRENDING UP</span>
            </div>
          </div>
        </div>
        
        <WaveChart />
        
        <div className="mt-6 flex justify-between items-center text-[#3D5A54]/40 font-sans text-[10px] uppercase tracking-widest font-medium">
            <span>February 2026</span>
            <span>April 2026</span>
        </div>
      </Card>

      {/* ── Timeline Section (Card Feed) ─────────────────────────────────── */}
      <div className="animate-fade-up stagger-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#3D5A54]">Your Timeline</h2>
          <div className="flex gap-2 p-1 bg-[#E8F2EE] rounded-xl border border-[#B8D4C0]">
              {(["all", "sessions", "checkins"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-4 py-1.5 rounded-lg font-sans text-xs font-medium transition-all",
                        activeTab === tab 
                            ? "bg-white text-[#3D5A54] shadow-sm" 
                            : "text-[#3D5A54]/50 hover:text-[#3D5A54]"
                    )}
                  >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTimeline.map((item, i) => (
            <Card
              key={item.id}
              className={cn(
                  "animate-reveal-up border-l-4 transition-all hover:scale-[1.01]",
                  item.status === "future" ? "border-l-[#7BA89A] bg-[#FAFCFA]" : 
                  item.status === "missed" ? "border-l-[#B03030]/30 grayscale-[0.8]" : 
                  "border-l-[#E8F2EE]"
              )}
              padding="md"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-5">
                <div className="flex flex-col items-center min-w-[60px] pt-1">
                    <span className="font-serif text-sm text-[#3D5A54]">{item.date.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="font-sans text-[10px] text-[#3D5A54]/30">{item.time}</span>
                </div>

                <div className="w-px h-12 bg-[#E8F2EE]" />

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                             <h3 className="font-sans text-sm font-semibold text-[#3D5A54]">{item.label}</h3>
                             <span className={cn(
                                 "font-sans text-[10px] px-2 py-0.5 rounded-full border",
                                 item.type === "session" ? "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]" : "bg-[#F5F3EF] text-[#3D5A54]/60 border-[#E8F2EE]"
                             )}>
                                 {item.type === "session" ? "Session" : "Check-in"}
                             </span>
                        </div>
                        {item.status === "future" && (
                             <Link href="/dashboard/appointments">
                                <Button variant="ghost" size="sm" className="text-xs py-1 h-auto">Confirm</Button>
                             </Link>
                        )}
                    </div>
                    <p className="font-sans text-sm text-[#3D5A54]/70 leading-relaxed">
                        {item.detail}
                    </p>
                </div>

                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                    item.status === "done" ? "bg-[#7BA89A] text-white border-transparent" :
                    item.status === "missed" ? "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]" :
                    "bg-white text-[#7BA89A] border-[#E8F2EE]"
                )}>
                    {item.status === "done" ? "✓" : item.status === "future" ? "◎" : "✕"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Footer CTA ─────────────────────────────────────────────────── */}
      <div className="animate-fade-up text-center pt-8 border-t border-[#E8F2EE]">
          <p className="font-serif text-xl text-[#3D5A54]">Have questions about your progress?</p>
          <p className="font-sans text-sm text-[#3D5A54]/50 mt-1 mb-6">Your counsellor is here to support you anytime.</p>
          <Link href="/dashboard/chat">
            <Button size="lg" className="px-10 rounded-full shadow-lg shadow-[#7BA89A]/10">
                Message Dr. Menon
            </Button>
          </Link>
      </div>

    </div>
  );
}
