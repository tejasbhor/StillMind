"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { adminApi, type AdminStudent, type AdminCounselor } from "@/services/api";

function ReassignModal({ 
  student, 
  counselors, 
  onClose, 
  onSuccess 
}: { 
  student: AdminStudent; 
  counselors: AdminCounselor[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [reason, setReason] = useState("Manual reassignment");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReassign = async () => {
    if (!selectedCounselorId) return;
    setSubmitting(true);
    setError("");
    try {
      await adminApi.reassignAllocation({
        allocation_id: student.allocation_id!,
        to_counselor_id: selectedCounselorId,
        reason
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to reassign student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3D5A54]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-fade-up" padding="lg">
        <h2 className="font-serif text-xl text-[#3D5A54] mb-2">Reassign Student</h2>
        <p className="font-sans text-sm text-[#3D5A54]/70 mb-6">
          Move <strong>{student.full_name}</strong> to a different counselor.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D5A54]/60 uppercase mb-1">Target Counselor</label>
            <select 
              value={selectedCounselorId}
              onChange={(e) => setSelectedCounselorId(e.target.value)}
              className="w-full bg-[#E8F2EE] border-0 rounded-xl px-4 py-3 text-sm text-[#3D5A54] focus:ring-2 focus:ring-[#7BA89A] transition-all"
            >
              <option value="">Select a counselor...</option>
              {counselors.map(c => (
                <option key={c.counselor_id} value={c.counselor_id}>
                  {c.full_name} ({c.assigned_students || 0}/{c.max_active_cases || 10}) — {c.specialties?.join(", ") || "No specialties listed"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D5A54]/60 uppercase mb-1">Reason</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#E8F2EE] border-0 rounded-xl px-4 py-3 text-sm text-[#3D5A54] focus:ring-2 focus:ring-[#7BA89A] transition-all h-20"
              placeholder="Reason for reassignment..."
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button 
              className="flex-1" 
              disabled={!selectedCounselorId || submitting}
              onClick={handleReassign}
            >
              {submitting ? "Processing..." : "Reassign"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [counselors, setCounselors] = useState<AdminCounselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassigningStudent, setReassigningStudent] = useState<AdminStudent | null>(null);

  const fetchData = async () => {
    try {
      const [stuRes, counRes] = await Promise.all([
        adminApi.getStudents(100, 0),
        adminApi.getCounselors(100, 0, true)
      ]);
      setStudents(stuRes.data || []);
      setCounselors(counRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        <Card className="lg:col-span-3" padding="md">
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
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70">Assigned To</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#3D5A54]/70 text-right">Actions</th>
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
                      {s.assigned_counselor || (
                        <span className="italic text-[#A0700A]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.allocation_id ? (
                        <button 
                          onClick={() => setReassigningStudent(s)}
                          className="text-xs font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
                        >
                          Reassign
                        </button>
                      ) : (
                        <span className="text-xs text-[#3D5A54]/30">No active assignment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {reassigningStudent && (
        <ReassignModal 
          student={reassigningStudent}
          counselors={counselors.filter(c => c.counselor_id !== reassigningStudent.assigned_counselor)}
          onClose={() => setReassigningStudent(null)}
          onSuccess={() => {
            setReassigningStudent(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

