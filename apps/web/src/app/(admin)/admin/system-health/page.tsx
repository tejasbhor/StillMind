"use client";

import Card from "@/components/ui/Card";

export default function AdminSystemHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">System Health Metrics</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          Operational telemetry and infrastructure status.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 animate-fade-up stagger-1">
        {[
          { label: "API Uptime", value: "99.98%", stat: "Stable" },
          { label: "WebSocket Active", value: "842", stat: "Connections" },
          { label: "Queue Delay", value: "1.2s", stat: "Optimal" },
        ].map(m => (
          <Card key={m.label} padding="md">
            <h2 className="font-sans text-xs text-[#3D5A54]/60">{m.label}</h2>
            <p className="font-serif text-2xl text-[#3D5A54] mt-1">{m.value}</p>
            <p className="font-sans text-xs text-[#3D5A54]/60 mt-0.5">{m.stat}</p>
          </Card>
        ))}
      </div>

      <Card padding="md" className="animate-fade-up stagger-2">
        <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Service Status</h2>
        <div className="flex flex-col gap-3">
            {[
              { name: "Risk Allocation Engine", status: "Operational", color: "bg-[#7BA89A]" },
              { name: "Notification Gateway", status: "Operational", color: "bg-[#7BA89A]" },
              { name: "Chat Service", status: "Operational", color: "bg-[#7BA89A]" },
              { name: "PostgreSQL Database", status: "Operational", color: "bg-[#7BA89A]" },
            ].map(s => (
                <div key={s.name} className="flex items-center justify-between border-b border-[#E8F2EE] pb-2 last:border-0 last:pb-0">
                    <span className="font-sans text-sm text-[#3D5A54]">{s.name}</span>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.color}`} />
                        <span className="font-sans text-xs text-[#3D5A54]/60">{s.status}</span>
                    </div>
                </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

