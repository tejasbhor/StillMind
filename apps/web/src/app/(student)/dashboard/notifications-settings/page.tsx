"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import PageHeader from "@/components/ui/PageHeader";
import { studentApi } from "@/services/api";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";

const DEFAULTS = {
  email_enabled: true,
  push_enabled: true,
  appointment_reminders: true,
  message_alerts: true,
  weekly_check_in: false,
};

type NotificationSettings = typeof DEFAULTS;

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await studentApi.getProfile();
      const envelope = res as { data?: { notification_preferences?: Partial<NotificationSettings>; version?: number | null } };
      const data = envelope.data;
      setVersion(data?.version ?? null);
      if (data?.notification_preferences) {
        setSettings({ ...DEFAULTS, ...data.notification_preferences });
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setSaveError(null);
    try {
      await studentApi.updateProfile({
        notification_preferences: settings,
        version: version ?? undefined,
      });
      setSuccess(true);
      const refresh = await studentApi.getProfile();
      const env = refresh as { data?: { version?: number | null } };
      setVersion(env.data?.version ?? null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading preferences…" className="min-h-[40vh]" />;
  }

  if (loadError) {
    return <ErrorState title="Unable to load settings" message={loadError} onRetry={() => void load()} className="min-h-[40vh]" />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <PageHeader title="Notification settings" subtitle="Manage how you receive notifications" backHref="/dashboard" backLabel="Back to dashboard" />

      {saveError && (
        <div className="mb-4 rounded-xl border border-[#F5B8B8] bg-[#FDEAEA] px-4 py-3 font-sans text-sm text-[#B03030]">{saveError}</div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="bg-white rounded-2xl border border-[#E8F2EE] p-6 md:p-8 flex flex-col gap-6">
        {success && (
          <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
            <p className="font-sans text-base text-[#3D5A54]">Settings saved.</p>
          </div>
        )}

        <div>
          <h3 className="font-serif text-lg text-[#3D5A54] mb-4">Channels</h3>
          <div className="flex flex-col gap-3">
            {(
              [
                ["email_enabled", "Email", "Appointment and account updates via email"],
                ["push_enabled", "Push", "Browser push when enabled on your device"],
              ] as const
            ).map(([key, title, sub]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleSetting(key)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  settings[key] ? "bg-[#E8F2EE] border-[#7BA89A]" : "border-[#E8F2EE] hover:border-[#B8D4C0]"
                )}
              >
                <div className="text-left">
                  <p className="font-sans text-base font-medium text-[#3D5A54]">{title}</p>
                  <p className="font-sans text-sm text-[#3D5A54]/70">{sub}</p>
                </div>
                <div className={cn("flex h-6 w-11 items-center rounded-full transition-colors", settings[key] ? "bg-[#7BA89A]" : "bg-[#B8D4C0]")}>
                  <div className={cn("h-5 w-5 rounded-full bg-white transition-transform", settings[key] ? "translate-x-5" : "translate-x-0.5")} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#E8F2EE]" />

        <div>
          <h3 className="font-serif text-lg text-[#3D5A54] mb-4">Types</h3>
          <div className="flex flex-col gap-3">
            {(
              [
                ["appointment_reminders", "Appointment reminders", "Before scheduled sessions"],
                ["message_alerts", "Message alerts", "When your counselor messages you"],
                ["weekly_check_in", "Weekly check-in nudges", "Optional reminders to complete a check-in"],
              ] as const
            ).map(([key, title, sub]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleSetting(key)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  settings[key] ? "bg-[#E8F2EE] border-[#7BA89A]" : "border-[#E8F2EE] hover:border-[#B8D4C0]"
                )}
              >
                <div className="text-left">
                  <p className="font-sans text-base font-medium text-[#3D5A54]">{title}</p>
                  <p className="font-sans text-sm text-[#3D5A54]/70">{sub}</p>
                </div>
                <div className={cn("flex h-6 w-11 items-center rounded-full transition-colors", settings[key] ? "bg-[#7BA89A]" : "bg-[#B8D4C0]")}>
                  <div className={cn("h-5 w-5 rounded-full bg-white transition-transform", settings[key] ? "translate-x-5" : "translate-x-0.5")} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="btn-primary text-base px-6 py-3">
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
