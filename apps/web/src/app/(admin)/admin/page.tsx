"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const RISK_DIST = [
  { name: "Green",  value: 65, color: "#7BA89A" },
  { name: "Yellow", value: 25, color: "#D4900A" },
  { name: "Red",    value: 10, color: "#B03030" },
];

const UTILIZATION = [
  { day: "Mon", used: 8,  available: 10 },
  { day: "Tue", used: 10, available: 10 },
  { day: "Wed", used: 7,  available: 10 },
  { day: "Thu", used: 9,  available: 10 },
  { day: "Fri", used: 6,  available: 10 },
];

const METRICS = [
  { label: "Total students",      value: "1,204", sub: "+12 this week",       color: "#3D5A54" },
  { label: "Active users",        value: "892",   sub: "74% engagement",       color: "#3D5A54" },
  { label: "Total counsellors",   value: "8",     sub: "All active",           color: "#3D5A54" },
  { label: "Avg wait time",       value: "2.4d",  sub: "↓ from 3.1d",         color: "#7BA89A" },
  { label: "Slot utilisation",    value: "84%",   sub: "40/48 slots used",     color: "#7BA89A" },
  { label: "Backlog",             value: "23",    sub: "Unassigned eligible",  color: "#A0700A" },
];

const ACTIVE_ALERTS = [
  { id: "al1", type: "warning", label: "RED case backlog", detail: "7 RED students awaiting assignment. Consider adding temporary slots.", action: "Add slots" },
  { id: "al2", type: "info",    label: "High no-show rate", detail: "No-show rate this week: 18% (target: <10%).", action: "Review" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">System overview</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          Wednesday, 16 April 2026 · All data is aggregated; no individual clinical data shown.
        </p>
      </div>

      {/* ── Metric cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up stagger-1">
        {METRICS.map((m) => (
          <Card key={m.label} padding="md" className="flex flex-col gap-1">
            <p className="font-sans text-xs text-[#3D5A54]/60">{m.label}</p>
            <p className="font-serif text-2xl" style={{ color: m.color }}>{m.value}</p>
            <p className="font-sans text-xs text-[#3D5A54]/60">{m.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Risk distribution ───────────────────────────────────────────── */}
        <Card className="animate-fade-up stagger-2" padding="md">
          <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Risk distribution</h2>
          <p className="font-sans text-xs font-normal text-[#3D5A54]/60 mb-4">
            Aggregated percentages only — no individual identification.
          </p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={RISK_DIST}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {RISK_DIST.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ fontFamily: "DM Sans", fontSize: 12, border: "1px solid #E8F2EE", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {RISK_DIST.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="font-sans text-sm text-[#3D5A54]">{d.name}</span>
                  <span className="font-serif text-lg text-[#3D5A54] ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Slot utilisation ────────────────────────────────────────────── */}
        <Card className="animate-fade-up stagger-3" padding="md">
          <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Slot utilisation this week</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={UTILIZATION} barGap={4}>
              <CartesianGrid vertical={false} stroke="#E8F2EE" />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#94A3B8" }} />
              <YAxis hide domain={[0, 12]} />
              <Tooltip
                contentStyle={{ fontFamily: "DM Sans", fontSize: 12, border: "1px solid #E8F2EE", borderRadius: 8 }}
              />
              <Bar dataKey="available" fill="#E8F2EE"    radius={[4, 4, 0, 0]} name="Available" />
              <Bar dataKey="used"      fill="#7BA89A"    radius={[4, 4, 0, 0]} name="Used" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Active alerts ─────────────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-4" padding="md">
        <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Active alerts</h2>
        {ACTIVE_ALERTS.length === 0 ? (
          <p className="font-sans text-sm font-light text-[#3D5A54]/40">No active alerts. System operating normally.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {ACTIVE_ALERTS.map((a) => (
              <div
                key={a.id}
                className={`flex items-start gap-4 rounded-xl border p-4 ${
                  a.type === "warning"
                    ? "bg-[#FEF4E0] border-[#E8D4B0]"
                    : "bg-[#E8EEF5] border-[#C4D4E8]"
                }`}
              >
                <span className={`text-lg mt-0.5 ${a.type === "warning" ? "text-[#A0700A]" : "text-[#7F96B8]"}`}>
                  {a.type === "warning" ? "⚠" : "ℹ"}
                </span>
                <div className="flex-1">
                  <p className={`font-sans text-sm font-medium ${a.type === "warning" ? "text-[#A0700A]" : "text-[#7F96B8]"}`}>
                    {a.label}
                  </p>
                  <p className="font-sans text-xs font-normal text-[#3D5A54]/70 mt-0.5">{a.detail}</p>
                </div>
                <Link
                  href="/admin/config"
                  className="font-sans text-xs font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors whitespace-nowrap"
                >
                  {a.action} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/counselors",    label: "Manage counsellors",   icon: "⊕" },
          { href: "/admin/config",        label: "Risk thresholds",      icon: "⚙" },
          { href: "/admin/audit-logs",    label: "Audit logs",           icon: "≡" },
          { href: "/admin/system-health", label: "System health",        icon: "◉" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="card flex flex-col items-center gap-2 p-5 text-center">
            <span className="text-2xl text-[#7BA89A]">{l.icon}</span>
            <span className="font-sans text-sm font-medium text-[#3D5A54]">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
