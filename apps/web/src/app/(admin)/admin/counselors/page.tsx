"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

const COUNSELORS = [
  { id: "c1", name: "Dr. Priya Menon",    email: "p.menon@uni.edu",    slots: 10, active: true,  students: 31 },
  { id: "c2", name: "Dr. Rohan Iyer",     email: "r.iyer@uni.edu",     slots: 8,  active: true,  students: 24 },
  { id: "c3", name: "Ms. Kavya Sharma",   email: "k.sharma@uni.edu",   slots: 12, active: true,  students: 38 },
  { id: "c4", name: "Dr. Anand Pillai",   email: "a.pillai@uni.edu",   slots: 10, active: false, students: 0  },
];

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState(COUNSELORS);
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState("");
  const [newEmail, setNewEmail]     = useState("");
  const [newSlots, setNewSlots]     = useState("10");
  const [adding, setAdding]         = useState(false);

  const toggleActive = (id: string) =>
    setCounselors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );

  const handleAdd = async () => {
    setAdding(true);
    await new Promise((r) => setTimeout(r, 800));
    setCounselors((prev) => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        name: newName,
        email: newEmail,
        slots: parseInt(newSlots),
        active: true,
        students: 0,
      },
    ]);
    setNewName(""); setNewEmail(""); setNewSlots("10");
    setAdding(false);
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#3D5A54]">Counsellors</h1>
          <p className="font-sans font-light text-sm text-[#3D5A54]/55 mt-1">
            {counselors.filter((c) => c.active).length} active · {counselors.length} total
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
                  <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-medium text-[#3D5A54]/40 tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counselors.map((c, i) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b border-[#E8F2EE] transition-colors",
                    i % 2 === 0 ? "bg-white" : "bg-[#FAFCFA]",
                    "hover:bg-[#E8F2EE]/40"
                  )}
                >
                  <td className="px-5 py-4 font-sans text-sm font-medium text-[#3D5A54]">{c.name}</td>
                  <td className="px-5 py-4 font-sans text-sm text-[#3D5A54]/60">{c.email}</td>
                  <td className="px-5 py-4">
                    <span className="font-sans text-sm font-medium text-[#3D5A54]">{c.slots}</span>
                  </td>
                  <td className="px-5 py-4 font-sans text-sm text-[#3D5A54]/60">{c.students}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "text-xs font-sans rounded-full px-2.5 py-1 border",
                        c.active
                          ? "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]"
                          : "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]"
                      )}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={c.active ? "danger" : "ghost"}
                        onClick={() => toggleActive(c.id)}
                        id={`toggle-counselor-${c.id}`}
                      >
                        {c.active ? "Deactivate" : "Reactivate"}
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
