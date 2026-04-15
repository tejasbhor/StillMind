"use client";

import Card from "@/components/ui/Card";

export default function AdminStudentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Student Management</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          Limited view. Clinical notes and detailed risk histories are intentionally hidden.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up stagger-1">
        <Card className="lg:col-span-2" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#3D5A54]">Student Directory</h2>
            <div className="px-3 py-1 bg-[#E8F2EE] text-[#3D5A54] rounded-full text-xs font-sans">
              1,204 Enrolled
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8F2EE]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Last Check-in</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "STU-001", status: "Active", date: "Today", counselor: "Dr. P. Menon" },
                  { id: "STU-002", status: "Inactive", date: "14 days ago", counselor: "Unassigned" },
                  { id: "STU-003", status: "Active", date: "Yesterday", counselor: "Dr. A. Sharma" },
                  { id: "STU-004", status: "Active", date: "Today", counselor: "Dr. P. Menon" },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-[#E8F2EE] last:border-0 hover:bg-[#FAFCFA]">
                    <td className="px-4 py-3 text-sm font-medium text-[#3D5A54]">{s.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'Active' ? 'bg-[#E8F2EE] text-[#3D5A54]' : 'bg-[#FAFAFA] text-[#3D5A54]/40'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#3D5A54]/70">{s.date}</td>
                    <td className="px-4 py-3 text-sm text-[#3D5A54]/70">{s.counselor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card padding="md">
            <h3 className="font-serif text-md text-[#3D5A54] mb-2">Privacy & Governance</h3>
            <p className="font-sans text-xs text-[#3D5A54]/70 leading-relaxed mb-4">
              As an Administrator, you are prohibited from viewing raw mental health data. If you require insights into high-risk clusters, refer to aggregated reports in the Analytics view.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
