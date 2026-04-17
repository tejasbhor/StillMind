"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { api, adminApi } from "@/lib/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RiskDistribution {
  green: number;
  yellow: number;
  red: number;
}

interface ResourceUtilization {
  slots_available: number;
  slots_used: number;
  utilization_rate: number;
  backlog_unassigned_students: number;
}

interface SystemAlert {
  type: string;
  label: string;
  detail: string;
  action: string;
}

interface DashboardData {
  total_active_students?: number;
  total_counselors?: number;
  average_wait_time_days?: number;
  risk_distribution?: { green: number; yellow: number; red: number };
}

interface RiskDistribution {
  green: number;
  yellow: number;
  red: number;
}

interface ResourceUtilization {
  slots_available: number;
  slots_used: number;
  utilization_rate: number;
  backlog_unassigned_students: number;
}

interface SystemAlert {
  type: string;
  label: string;
  detail: string;
  action: string;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistribution>({ green: 0, yellow: 0, red: 0 });
  const [utilization, setUtilization] = useState<ResourceUtilization>({ slots_available: 0, slots_used: 0, utilization_rate: 0, backlog_unassigned_students: 0 });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, riskRes, utilRes, alertsRes] = await Promise.all([
          api.get<any>("/admin/dashboard"),
          adminApi.getRiskDistribution(),
          adminApi.getResourceUtilization(),
          adminApi.getAlerts()
        ]);
        
        setDashboardData(dashRes.data);
        setRiskDist(riskRes.data);
        setUtilization(utilRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-serif text-[#3D5A54]">Loading system overview...</div>;
  }

  const riskChartData = [
    { name: "Green", value: riskDist.green || 65, color: "#7BA89A" },
    { name: "Yellow", value: riskDist.yellow || 25, color: "#D4900A" },
    { name: "Red", value: riskDist.red || 10, color: "#B03030" },
  ];

  const m: DashboardData = dashboardData || {};
  
  const METRICS: { label: string; value: string; sub: string; color: string }[] = [
    { label: "Total students", value: m.total_active_students?.toLocaleString() || "0", sub: "Enrolled", color: "#3D5A54" },
    { label: "Active users", value: m.total_counselors?.toString() || "0", sub: "Counselors", color: "#3D5A54" },
    { label: "Avg wait time", value: `${m.average_wait_time_days || 0}d`, sub: "For assignment", color: "#7BA89A" },
    { label: "Slot utilisation", value: `${utilization.utilization_rate || 0}%`, sub: `${utilization.slots_used || 0}/${utilization.slots_available || 0} used`, color: "#7BA89A" },
    { label: "Backlog", value: (utilization.backlog_unassigned_students || 0).toString(), sub: "Unassigned eligible", color: "#A0700A" },
    { label: "Risk alerts", value: (alerts.length || 0).toString(), sub: "Active alerts", color: "#B03030" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">System overview</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          All data is aggregated; no individual clinical data shown.
        </p>
      </div>

      {/* ── Metric cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up stagger-1">
        {METRICS.map((m_item) => (
          <Card key={m_item.label} padding="md" className="flex flex-col gap-1">
            <p className="font-sans text-xs text-[#3D5A54]/60">{m_item.label}</p>
            <p className="font-serif text-2xl" style={{ color: m_item.color }}>{m_item.value}</p>
            <p className="font-sans text-xs text-[#3D5A54]/60">{m_item.sub}</p>
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
                  data={riskChartData}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {riskChartData.map((entry, i) => (
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
              {riskChartData.map((d) => (
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
          <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Slot utilisation</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm text-[#3D5A54]">Available</span>
              <span className="font-sans text-sm font-medium text-[#3D5A54]">{utilization.slots_available || 0}</span>
            </div>
            <div className="w-full bg-[#E8F2EE] rounded-full h-3">
              <div 
                className="bg-[#7BA89A] h-3 rounded-full transition-all" 
                style={{ width: `${utilization.utilization_rate || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#3D5A54]/60 mt-1">
              <span>{utilization.slots_used || 0} used</span>
              <span>{utilization.utilization_rate || 0}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Active alerts ─────────────────────────────────────────────────── */}
      <Card className="animate-fade-up stagger-4" padding="md">
        <h2 className="font-serif text-lg text-[#3D5A54] mb-4">Active alerts</h2>
        {alerts.length === 0 ? (
          <p className="font-sans text-sm font-light text-[#3D5A54]/40">No active alerts. System operating normally.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((a, i) => (
              <div
                key={i}
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
