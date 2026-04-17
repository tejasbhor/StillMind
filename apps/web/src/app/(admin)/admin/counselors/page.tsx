"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { cn } from "@/utils/cn";
import { adminApi, type AdminCounselor } from "@/services/api";

interface CounselorData extends AdminCounselor {
  name?: string;
}

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState<AdminCounselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState("");
  const [newEmail, setNewEmail]     = useState("");
  const [newSlots, setNewSlots]     = useState("10");
  const [adding, setAdding]         = useState(false);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await adminApi.getCounselors(100, 0);
        setCounselors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch counselors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const toggleActive = async (counselorId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminApi.deactivateCounselor(counselorId, "Admin action");
      } else {
        await adminApi.activateCounselor(counselorId);
      }
      setCounselors(prev => prev.map(c => 
        c.counselor_id === counselorId ? { ...c, is_active: !currentStatus } : c
      ));
    } catch (err) {
      console.error("Failed to toggle counselor status", err);
    }
  };

  const handleAdd = async () => {
    if (!newName || !newEmail) return;
    setAdding(true);
    try {
      const res = await adminApi.createCounselor({
        email: newEmail,
        full_name: newName,
        max_slots_day: parseInt(newSlots) || 10
      });
      setCounselors(prev => [...prev, {
        counselor_id: res.data?.counselor_id || `c${Date.now()}`,
        full_name: newName,
        email: newEmail,
        max_slots_day: parseInt(newSlots) || 10,
        is_active: true,
        assigned_students: 0
      }]);
      setNewName(""); setNewEmail(""); setNewSlots("10");
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to create counselor", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-serif text-[#3D5A54]">Loading counselors...</div>;
  }

  const activeCount = counselors.filter(c => c.is_active).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">Counsellors</h1>
          <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
            {activeCount} active · {counselors.length} total
          </p>
        </div>
        <Button id="add-counselor-btn" onClick={() => setShowAdd(true)}>
          Add counsellor
        </Button>
      </div>

      <Card className="animate-fade-up stagger-1" padding="none">
        <div className="overflow-x-auto rounded-[20px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8F2EE] bg-[#FAFCFA]">
                {["Name", "Email", "Slots / day", "Assigned students", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-semibold text-[#3D5A54]/70 tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counselors.map((c, i) => (
                <tr
                  key={c.counselor_id}
                  className={cn(
                    "border-b border-[#E8F2EE] transition-colors",
                    i % 2 === 0 ? "bg-white" : "bg-[#FAFCFA]",
                    "hover:bg-[#E8F2EE]/40"
                  )}
                >
                  <td className="px-5 py-4 font-sans text-sm font-medium text-[#3D5A54]">{c.full_name}</td>
                  <td className="px-5 py-4 font-sans text-sm text-[#3D5A54]/75">{c.email}</td>
                  <td className="px-5 py-4">
                    <span className="font-sans text-sm font-medium text-[#3D5A54]">{c.max_slots_day}</span>
                  </td>
                  <td className="px-5 py-4 font-sans text-sm text-[#3D5A54]/75">{c.assigned_students}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "text-xs font-sans rounded-full px-2.5 py-1 border",
                        c.is_active
                          ? "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]"
                          : "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]"
                      )}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={c.is_active ? "danger" : "ghost"}
                        onClick={() => toggleActive(c.counselor_id, c.is_active)}
                        id={`toggle-counselor-${c.counselor_id}`}
                      >
                        {c.is_active ? "Deactivate" : "Reactivate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add new counsellor">
        <div className="flex flex-col gap-4">
          <Input
            id="new-counselor-name"
            label="Full name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Dr. Jane Smith"
          />
          <Input
            id="new-counselor-email"
            label="Email address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="j.smith@university.edu"
          />
          <Input
            id="new-counselor-slots"
            label="Daily slot capacity"
            type="number"
            value={newSlots}
            onChange={(e) => setNewSlots(e.target.value)}
            hint="Maximum sessions this counsellor can handle per day."
          />
          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button
              loading={adding}
              disabled={!newName || !newEmail}
              onClick={handleAdd}
              className="flex-1"
              id="confirm-add-counselor"
            >
              Add counsellor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

