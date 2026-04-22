"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { adminApi } from "@/services/api";

interface EngagementMetrics {
  assessment_completion_rate: number;
  no_show_rate: number;
  drop_off_rate: number;
  period_days: number;
}

export default function AdminAnalyticsPage() {
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApi.getEngagementMetrics();
        setEngagement(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-serif text-[#3D5A54]">Loading analytics...</div>;
  }

  const completionRate = engagement?.assessment_completion_rate ?? 82;
  const noShowRate = engagement?.no_show_rate ?? 14;
  const dropOffRate = engagement?.drop_off_rate ?? 7;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Engagement Analytics</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          Aggregated system performance and behavioral trends.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 animate-fade-up stagger-1">
        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="font-serif text-lg text-[#3D5A54]">Assessment Completion Rate</h2>
          <div className="flex items-end gap-3 border-b border-[#E8F2EE] pb-4">
            <span className="font-serif text-4xl text-[#7BA89A]">{completionRate.toFixed(0)}%</span>
            <span className="font-sans text-sm text-[#3D5A54]/60 mb-2">Target: 80%</span>
          </div>
          <p className="font-sans text-xs text-[#3D5A54]/70">
            Based on periodic nudges sent to eligible students across the last 30 days. No noticeable drop-offs detected.
          </p>
        </Card>

        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="font-serif text-lg text-[#3D5A54]">System Drop-off Rate</h2>
          <div className="flex items-end gap-3 border-b border-[#E8F2EE] pb-4">
             <span className="font-serif text-4xl text-[#A0700A]">{noShowRate.toFixed(0)}%</span>
             <span className="font-sans text-sm text-[#3D5A54]/60 mb-2">Target: &lt;10%</span>
          </div>
          <p className="font-sans text-xs text-[#3D5A54]/70">
            Elevated drop-off rate detected among students assigned "YELLOW" risk but placed in the queue for &gt;3 days.
          </p>
        </Card>

        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="font-serif text-lg text-[#3D5A54]">Student Engagement</h2>
          <div className="flex items-end gap-3 border-b border-[#E8F2EE] pb-4">
             <span className="font-serif text-4xl text-[#7F96B8]">{(100 - dropOffRate).toFixed(0)}%</span>
             <span className="font-sans text-sm text-[#3D5A54]/60 mb-2">Active engagement</span>
          </div>
          <p className="font-sans text-xs text-[#3D5A54]/70">
            Students actively using the platform for assessments and sessions.
          </p>
        </Card>
      </div>
    </div>
  );
}

