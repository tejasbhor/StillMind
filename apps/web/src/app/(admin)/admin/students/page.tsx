"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { adminApi, type AdminStudent } from "@/lib/api";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await adminApi.getStudents(100, 0);
        setStudents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-serif text-[#3D5A54]">Loading students...</div>;
  }

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
              {students.length} Enrolled
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8F2EE]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Last Activity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id} className="border-b border-[#E8F2EE] last:border-0 hover:bg-[#FAFCFA]">
                    <td className="px-4 py-3 text-sm font-medium text-[#3D5A54]">{s.college_id || s.student_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-[#3D5A54]">{s.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.profile_status === 'ACTIVE' ? 'bg-[#E8F2EE] text-[#3D5A54]' : 'bg-[#FAFAFA] text-[#3D5A54]/40'}`}>
                        {s.profile_status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#3D5A54]/70">
                      {s.last_activity ? new Date(s.last_activity).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#3D5A54]/70">{s.assigned_counselor || 'Unassigned'}</td>
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
