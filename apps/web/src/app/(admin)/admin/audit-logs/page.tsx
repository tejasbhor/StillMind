"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const LOGS = [
  { id: "al1", time: "2026-04-16 08:44:12", actor: "admin@uni.edu", role: "admin",    action: "COUNSELOR_DEACTIVATED",   resource: "counselor_profiles", resourceId: "c4", meta: { reason: "On leave" } },
  { id: "al2", time: "2026-04-16 08:30:00", actor: "system",        role: "system",   action: "ALLOCATION_CREATED",       resource: "allocations",        resourceId: "apl-009", meta: { student: "STU-004", reason: "RED + worsening trend" } },
  { id: "al3", time: "2026-04-15 16:22:05", actor: "p.menon@uni.edu", role: "counselor", action: "COUNSELOR_OVERRIDE",   resource: "allocations",        resourceId: "apl-007", meta: { system_priority: 1, action: "DEPRIORITIZED", reason: "Student stable" } },
  { id: "al4", time: "2026-04-15 14:10:33", actor: "admin@uni.edu", role: "admin",    action: "RISK_THRESHOLD_UPDATED",  resource: "system_config",      resourceId: "cfg-001", meta: { field: "yellow_max", from: 0.55, to: 0.60 } },
  { id: "al5", time: "2026-04-15 11:05:17", actor: "system",        role: "system",   action: "SLOT_RELEASED",            resource: "allocations",        resourceId: "apl-006", meta: { reason: "T-12 no confirmation" } },
  { id: "al6", time: "2026-04-15 09:00:00", actor: "system",        role: "system",   action: "ALLOCATION_RUN_COMPLETED", resource: "system",             resourceId: null, meta: { assigned: 6, queued: 14 } },
];

const ROLE_COLOR: Record<string, string> = {
  admin:     "bg-[#E8EEF5] text-[#7F96B8] border-[#C4D4E8]",
  system:    "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]",
  counselor: "bg-[#FEF4E0] text-[#A0700A] border-[#E8D4B0]",
};

export default function AuditLogsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter,   setFilter]   = useState("");

  const filtered = LOGS.filter(
    (l) => !filter || l.action.includes(filter.toUpperCase()) || l.role.includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Audit logs</h1>
        <p className="font-sans font-light text-sm text-[#3D5A54]/55 mt-1">
          Append-only. Every mutation is captured — no edits, no deletes.
        </p>
      </div>

      {/* Filter */}
      <div className="animate-fade-up stagger-1 flex gap-3">
        <input
          type="text"
          placeholder="Filter by action or role…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 rounded-xl border border-[#B8D4C0] bg-white px-4 py-2.5 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 focus:outline-none focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20 transition-all"
        />
      </div>

      <Card className="animate-fade-up stagger-2" padding="none">
        <div className="overflow-x-auto rounded-[20px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8F2EE] bg-[#FAFCFA]">
                {["Timestamp", "Actor", "Role", "Action", "Resource", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-medium text-[#3D5A54]/40 tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <>
                  <tr
                    key={log.id}
                    className={cn(
                      "border-b border-[#E8F2EE] transition-colors cursor-none",
                      i % 2 === 0 ? "bg-white" : "bg-[#FAFCFA]",
                      "hover:bg-[#E8F2EE]/30"
                    )}
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-[#3D5A54]/60 whitespace-nowrap">{log.time}</td>
                    <td className="px-5 py-3.5 font-sans text-sm text-[#3D5A54]">{log.actor}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs font-sans rounded-full px-2.5 py-0.5 border", ROLE_COLOR[log.role])}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#3D5A54] whitespace-nowrap">{log.action}</td>
                    <td className="px-5 py-3.5 font-sans text-xs text-[#3D5A54]/60">{log.resource}</td>
                    <td className="px-5 py-3.5 text-[#3D5A54]/30 text-sm">
                      {expanded === log.id ? "↑" : "↓"}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-meta`} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFCFA]"}>
                      <td colSpan={6} className="px-5 pb-4">
                        <div className="rounded-xl bg-[#F0F5F2] border border-[#E8F2EE] p-4">
                          <p className="font-sans text-xs font-medium text-[#3D5A54]/40 mb-2">Metadata</p>
                          <pre className="font-mono text-xs text-[#3D5A54]/70 overflow-x-auto">
                            {JSON.stringify(log.meta, null, 2)}
                          </pre>
                          {log.resourceId && (
                            <p className="font-mono text-xs text-[#3D5A54]/40 mt-2">
                              resource_id: {log.resourceId}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-sans text-sm text-[#3D5A54]/40">
                    No logs match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
