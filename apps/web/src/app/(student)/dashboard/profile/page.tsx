"use client";

import { useState, useEffect, useCallback } from "react";
import { studentApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import PageHeader from "@/components/ui/PageHeader";

interface StudentProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  guardian_contact: {
    name: string;
    phone: string;
    relation: string;
  } | null;
  version: number | null;
}

export default function EditProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.getProfile();
      const data: StudentProfile = res?.data || res;
      setFullName(data?.full_name || "");
      setPhone(data?.phone || "");
      setVersion(data?.version ?? null);
      if (data?.guardian_contact) {
        setGuardianName(data.guardian_contact.name || "");
        setGuardianPhone(data.guardian_contact.phone || "");
        setGuardianRelation(data.guardian_contact.relation || "");
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (fullName && fullName.length > 100) {
      setError("Name must not exceed 100 characters.");
      setSaving(false);
      return;
    }
    if (phone && phone.replace(/\D/g, '').length > 20) {
      setError("Phone number too long.");
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        full_name: fullName || null,
        phone: phone || null,
        version: version,
      };

      // Only include guardian contact if all fields are filled
      if (guardianName && guardianPhone && guardianRelation) {
        updateData.guardian_contact = {
          name: guardianName,
          phone: guardianPhone,
          relation: guardianRelation,
        };
      } else if (!guardianName && !guardianPhone && !guardianRelation) {
        // All empty - clear it
        updateData.guardian_contact = null;
      }
      // If partial, don't include - let user fill all or clear all

      await studentApi.updateProfile(updateData);
      setSuccess(true);
      
      // Refresh version after save
      const refreshRes = await studentApi.getProfile();
      const refreshData: StudentProfile = refreshRes?.data || refreshRes;
      setVersion(refreshData?.version ?? null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      const message = e.message || "Failed to save profile.";
      
      // Handle concurrency conflict
      if (message.includes("modified") || message.includes("another")) {
        setError("Profile was modified elsewhere. Please refresh and try again.");
        await loadProfile(); // Refresh to get latest data
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#B8D4C0] border-t-[#7BA89A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <PageHeader 
        title="Edit Profile" 
        subtitle="Update your personal information"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8F2EE] p-6 md:p-8 flex flex-col gap-6">
        {success && (
          <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
            <p className="font-sans text-base text-[#3D5A54]">Profile saved successfully!</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
            <p className="font-sans text-base text-[#B03030]">{error}</p>
          </div>
        )}

        {/* Email (read-only) */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-medium text-[#3D5A54]">Email Address</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="px-4 py-3 rounded-xl border border-[#E8F2EE] bg-[#F5F3EF] font-sans text-base text-[#3D5A54]/60 cursor-not-allowed"
          />
          <p className="font-sans text-xs text-[#3D5A54]/50">Contact support to change your email</p>
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="font-sans text-sm font-medium text-[#3D5A54]">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E8F2EE] font-sans text-base text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="font-sans text-sm font-medium text-[#3D5A54]">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E8F2EE] font-sans text-base text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <hr className="border-[#E8F2EE]" />

        {/* Guardian Contact */}
        <div>
          <h3 className="font-serif text-lg text-[#3D5A54] mb-1">Emergency Contact</h3>
          <p className="font-sans text-sm text-[#3D5A54]/70 mb-4">Optional - Someone we can contact if needed</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="guardianName" className="font-sans text-sm font-medium text-[#3D5A54]">Contact Name</label>
              <input
                id="guardianName"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E8F2EE] font-sans text-base text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
                placeholder="Guardian name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="guardianRelation" className="font-sans text-sm font-medium text-[#3D5A54]">Relationship</label>
              <select
                id="guardianRelation"
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E8F2EE] font-sans text-base text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A] bg-white"
              >
                <option value="">Select...</option>
                <option value="Parent">Parent</option>
                <option value="Guardian">Guardian</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="guardianPhone" className="font-sans text-sm font-medium text-[#3D5A54]">Contact Phone</label>
              <input
                id="guardianPhone"
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E8F2EE] font-sans text-base text-[#3D5A54] focus:outline-none focus:border-[#7BA89A] focus:ring-1 focus:ring-[#7BA89A]"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="btn-primary text-base px-6 py-3">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}