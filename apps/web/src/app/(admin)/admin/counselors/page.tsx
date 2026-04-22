"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Modal } from "@/components/ui/Dialog";
import { cn } from "@/utils/cn";
import { adminApi, type AdminCounselor } from "@/services/api";
import { toast } from "sonner";

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
  const [newSpecialties, setNewSpecialties] = useState<string[]>([]);
  const [adding, setAdding]         = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [showReassign, setShowReassign] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [targetCounselorId, setTargetCounselorId] = useState("");

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
        toast.success("Counselor deactivated");
      } else {
        await adminApi.activateCounselor(counselorId);
        toast.success("Counselor reactivated");
      }
      setCounselors(prev => prev.map(c => 
        c.counselor_id === counselorId ? { ...c, is_active: !currentStatus } : c
      ));
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
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
        max_slots_day: parseInt(newSlots) || 10,
        specialties: newSpecialties
      });
      
      const newC: AdminCounselor = {
        counselor_id: res.data?.counselor_id || res.data?.id || `c${Date.now()}`,
        full_name: newName,
        email: newEmail,
        max_slots_day: parseInt(newSlots) || 10,
        is_active: true,
        assigned_students: 0
      };

      setCounselors(prev => [...prev, newC]);
      toast.success("Counselor created successfully");
      setNewName(""); setNewEmail(""); setNewSlots("10"); setNewSpecialties([]);
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create counselor");
      console.error("Failed to create counselor", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteCounselor(showDelete);
      setCounselors(prev => prev.filter(c => c.counselor_id !== showDelete));
      toast.success("Counselor deleted and cases released");
      setShowDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete counselor");
    } finally {
      setDeleting(false);
    }
  };

  const handleReassign = async () => {
    if (!showReassign || !targetCounselorId) return;
    setReassigning(true);
    try {
      await adminApi.reassignCounselor({
        from_counselor_id: showReassign,
        to_counselor_id: targetCounselorId,
        reason: "Manual administrative reassignment"
      });
      toast.success("Active cases reassigned successfully");
      
      // Update counts
      const res = await adminApi.getCounselors(100, 0);
      setCounselors(res.data || []);
      
      setShowReassign(null);
      setTargetCounselorId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign cases");
    } finally {
      setReassigning(false);
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
                {["Name", "Email", "Specialties", "Slots / day", "Assigned", "Status", "Actions"].map((h) => (
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
                    <div className="flex flex-wrap gap-1">
                      {(c.specialties || []).map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-[#E8F2EE] text-[#3D5A54] rounded-md font-sans font-medium uppercase">
                          {s.replace('_', ' ')}
                        </span>
                      ))}
                      {(!c.specialties || c.specialties.length === 0) && <span className="text-xs italic text-[#3D5A54]/30">Generalist</span>}
                    </div>
                  </td>
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
                        variant="ghost"
                        className={c.is_active ? "text-[#D4900A]" : "text-[#7BA89A]"}
                        onClick={() => toggleActive(c.counselor_id, c.is_active)}
                        id={`toggle-counselor-${c.counselor_id}`}
                      >
                        {c.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      
                      {c.assigned_students > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowReassign(c.counselor_id)}
                        >
                          Reassign
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setShowDelete(c.counselor_id)}
                        id={`delete-counselor-${c.counselor_id}`}
                      >
                        Delete
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
            floating={false}
            showFocusLine={false}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Dr. Jane Smith"
          />
          <Input
            id="new-counselor-email"
            label="Email address"
            floating={false}
            showFocusLine={false}
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="j.smith@university.edu"
          />
          <Input
            id="new-counselor-slots"
            label="Daily slot capacity"
            floating={false}
            showFocusLine={false}
            type="number"
            value={newSlots}
            onChange={(e) => setNewSlots(e.target.value)}
            hint="Maximum sessions this counsellor can handle per day."
          />
          <div>
            <label className="block text-xs font-semibold text-[#3D5A54]/60 uppercase mb-2">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {["ANXIETY", "DEPRESSION", "ACADEMIC_STRESS", "RELATIONSHIPS", "SUBSTANCE_ABUSE", "TRAUMA"].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setNewSpecialties(prev => 
                      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    newSpecialties.includes(s)
                      ? "bg-[#3D5A54] text-white border-[#3D5A54]"
                      : "bg-white text-[#3D5A54]/60 border-[#E8F2EE] hover:border-[#7BA89A]"
                  )}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
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

      {/* Delete Confirmation */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Confirm Deletion">
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-[#3D5A54]/70 leading-relaxed">
            Are you sure you want to delete this counsellor? 
            <br/><br/>
            <strong>Important:</strong> Any active students assigned to this counsellor will be released back to the "Unassigned" pool for re-prioritization.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={() => setShowDelete(null)} className="flex-1">Cancel</Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
              className="flex-1"
            >
              Delete counsellor
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Modal */}
      <Modal open={!!showReassign} onClose={() => setShowReassign(null)} title="Reassign Cases">
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-[#3D5A54]/70">
            Transfer all active cases from {counselors.find(c => c.counselor_id === showReassign)?.full_name} to:
          </p>
          
          <select 
            className="w-full rounded-xl border border-[#E8F2EE] p-3 font-sans text-sm text-[#3D5A54] bg-white outline-none focus:ring-2 focus:ring-[#7BA89A]/20"
            value={targetCounselorId}
            onChange={(e) => setTargetCounselorId(e.target.value)}
          >
            <option value="">Select target counsellor...</option>
            {counselors
              .filter(c => c.counselor_id !== showReassign && c.is_active)
              .map(c => (
                <option key={c.counselor_id} value={c.counselor_id}>
                  {c.full_name} ({c.assigned_students}/{c.max_slots_day})
                </option>
              ))
            }
          </select>

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={() => setShowReassign(null)} className="flex-1">Cancel</Button>
            <Button
              loading={reassigning}
              disabled={!targetCounselorId}
              onClick={handleReassign}
              className="flex-1"
            >
              Transfer cases
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

