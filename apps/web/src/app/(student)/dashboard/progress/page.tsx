"use client";

import Card from "@/components/ui/Card";

const TIMELINE = [
  {
    id: "t1",
    date: "16 Apr 2026",
    type: "session",
    label: "Upcoming session",
    detail: "With Dr. Priya Menon",
    status: "future",
  },
  {
    id: "t2",
    date: "2 Apr 2026",
    type: "session",
    label: "Session completed",
    detail: "Discussed academic pressure and sleep routine.",
    status: "done",
  },
  {
    id: "t3",
    date: "2 Apr 2026",
    type: "checkin",
    label: "Check-in submitted",
    detail: "Moving steadily.",
    status: "done",
  },
  {
    id: "t4",
    date: "18 Mar 2026",
    type: "session",
    label: "Session completed",
    detail: "Explored coping strategies for exam period.",
    status: "done",
  },
  {
    id: "t5",
    date: "4 Mar 2026",
    type: "session",
    label: "Session missed",
    detail: "No attendance recorded.",
    status: "missed",
  },
  {
    id: "t6",
    date: "18 Feb 2026",
    type: "checkin",
    label: "Check-in submitted",
    detail: "Some support available.",
    status: "done",
  },
];

const NODE_STYLE: Record<string, string> = {
  future: "border-[#7BA89A] bg-[#E8F2EE]",
  done:   "border-[#7BA89A] bg-[#7BA89A]",
  missed: "border-[#F5B8B8] bg-[#FDEAEA]",
};

const NODE_INNER: Record<string, string> = {
  future: "◎",
  done:   "✓",
  missed: "✕",
};

function WaveChart() {
  // Abstract wave representing progress over time (safe, no scores)
  return (
    <div className="relative w-full h-20 overflow-hidden rounded-xl bg-[#E8F2EE]">
      <svg
        viewBox="0 0 400 80"
        className="w-full h-full"
        preserveAspectRatio="none"
        aria-label="Abstract wellbeing trend over time — moving steadily"
      >
        {/* Background fill */}
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7BA89A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7BA89A" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path
          d="M0,55 C40,52 80,62 120,58 C160,54 200,44 240,40 C280,36 320,38 360,34 C380,32 390,30 400,29 L400,80 L0,80Z"
          fill="url(#wave-grad)"
        />
        <path
          d="M0,55 C40,52 80,62 120,58 C160,54 200,44 240,40 C280,36 320,38 360,34 C380,32 390,30 400,29"
          fill="none"
          stroke="#7BA89A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Data points */}
        {[
          { x: 0,   y: 55 },
          { x: 80,  y: 62 },
          { x: 160, y: 54 },
          { x: 240, y: 40 },
          { x: 320, y: 38 },
          { x: 400, y: 29 },
        ].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#7BA89A" fillOpacity="0.8" />
        ))}
      </svg>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Your progress</h1>
        <p className="font-sans font-light text-sm text-[#3D5A54]/55 mt-1">
          A calm view of how you've been moving forward. No scores — just direction.
        </p>
      </div>

      {/* Wave chart */}
      <Card className="animate-fade-up stagger-1" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-[#7BA89A]">Overall direction</p>
            <h2 className="font-serif text-xl text-[#3D5A54] mt-0.5">Moving steadily →</h2>
          </div>
          <span className="rounded-full bg-[#E8F2EE] border border-[#B8D4C0] px-3 py-1 font-sans text-xs text-[#3D5A54]">
            ↑ Improving
          </span>
        </div>
        <WaveChart />
        <p className="font-sans text-xs font-light text-[#3D5A54]/35 mt-3">
          Based on your last 4 check-ins. Each point represents a check-in — higher means better.
        </p>
      </Card>

      {/* Timeline */}
      <div className="animate-fade-up stagger-2">
        <h2 className="font-serif text-xl text-[#3D5A54] mb-5">Your timeline</h2>

        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E8F2EE]" />

          {TIMELINE.map((item, i) => (
            <div
              key={item.id}
              className="relative flex gap-5 pb-6"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Node */}
              <div
                className={`relative z-10 w-10 h-10 flex-shrink-0 rounded-full border-2 flex items-center justify-center font-sans text-sm ${NODE_STYLE[item.status]}`}
              >
                <span
                  className={
                    item.status === "done"
                      ? "text-white text-xs"
                      : item.status === "missed"
                        ? "text-[#B03030] text-xs"
                        : "text-[#7BA89A]"
                  }
                >
                  {NODE_INNER[item.status]}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5 pt-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">{item.label}</p>
                  <span className="font-sans text-xs text-[#7BA89A] rounded-full bg-[#E8F2EE] px-2 py-0.5">
                    {item.type === "session" ? "Session" : "Check-in"}
                  </span>
                </div>
                <p className="font-sans text-xs font-light text-[#3D5A54]/55">{item.detail}</p>
                <p className="font-sans text-xs text-[#3D5A54]/30 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
