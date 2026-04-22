"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { counselorApi } from "@/services/api";
import { cn } from "@/utils/cn";

export default function CounselorCapacityPage() {
  const [capacity, setCapacity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local state for edits
  const [maxCases, setMaxCases] = useState(10);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const res = await counselorApi.getCapacity();
        setCapacity(res.data);
        setMaxCases(res.data.max_active_cases);
        setIsActive(res.data.is_active);
      } catch (err: any) {
        setError(err.message || "Failed to load capacity settings");
      } finally {
        setLoading(false);
      }
    };
    fetchCapacity();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await counselorApi.updateCapacity({
        is_active: isActive,
        max_active_cases: maxCases
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState text="Loading capacity..." className="min-h-[50vh]" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={() => window.location.reload()} className="min-h-[50vh]" />;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Capacity Management</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/60 mt-1">
          Manage your workload and active availability status.
        </p>
      </div>

      <div className="flex flex-col gap-6 animate-fade-up stagger-1">
        <Card padding="lg">
          <h2 className="font-serif text-xl text-[#3D5A54] mb-6">Case Load</h2>
          
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-sm font-medium text-[#3D5A54]">Current Active Cases</p>
                <p className="font-sans text-xs text-[#3D5A54]/40">Number of students currently assigned to you.</p>
              </div>
              <span className="font-serif text-3xl text-[#3D5A54]">{capacity.current_active_cases}</span>
            </div>

            <div className="h-px bg-[#E8F2EE]" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-[#3D5A54]">Maximum Capacity</p>
                  <p className="font-sans text-xs text-[#3D5A54]/40">Upper limit for active student assignments.</p>
                </div>
                <span className="font-serif text-2xl text-[#3D5A54]">{maxCases}</span>
              </div>
              
              <div className="bg-[#FAFCFA] p-4 rounded-xl border border-[#E8F2EE]">
                <p className="font-sans text-xs text-[#3D5A54]/60 leading-relaxed">
                  Note: Your maximum capacity is set by the institution administrator. If you need to increase or decrease this limit, please submit a request through the internal portal.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="font-serif text-xl text-[#3D5A54] mb-6">Availability Status</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-sans text-sm font-medium text-[#3D5A54]">Active for Allocation</p>
              <p className="font-sans text-xs text-[#3D5A54]/40 mr-4">
                When disabled, you will not receive new student assignments from the waitlist.
              </p>
            </div>
            
            <button 
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                isActive ? "bg-[#7BA89A]" : "bg-[#E8F2EE]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isActive ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>
            {saved ? "Changes Saved" : "Update Status"}
          </Button>
        </div>
      </div>

      <div className="bg-[#FEF4E0] border border-[#E8D4B0] p-4 rounded-xl">
        <p className="font-sans text-xs text-[#A0700A] leading-relaxed">
          <strong>Important:</strong> Deactivating yourself will stop new assignments, but you are still responsible for your current {capacity.current_active_cases} active cases. To reassign existing students, please contact the Lead Counselor.
        </p>
      </div>
    </div>
  );
}
