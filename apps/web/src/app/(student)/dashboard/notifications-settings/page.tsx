"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import PageHeader from "@/components/ui/PageHeader";

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  appointmentReminders: boolean;
  messageAlerts: boolean;
  weeklyCheckIn: boolean;
}

export default function NotificationSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: true,
    appointmentReminders: true,
    messageAlerts: true,
    weeklyCheckIn: false,
  });

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <PageHeader 
        title="Notification Settings" 
        subtitle="Manage how you receive notifications"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8F2EE] p-6 md:p-8 flex flex-col gap-6">
        {success && (
          <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
            <p className="font-sans text-base text-[#3D5A54]">Settings saved successfully!</p>
          </div>
        )}

        {/* Notification Channels */}
        <div>
          <h3 className="font-serif text-lg text-[#3D5A54] mb-4">Notification Channels</h3>
          
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => toggleSetting("emailEnabled")}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                settings.emailEnabled
                  ? "bg-[#E8F2EE] border-[#7BA89A]"
                  : "border-[#E8F2EE] hover:border-[#B8D4C0]"
              )}
            >
              <div className="text-left">
                <p className="font-sans text-base font-medium text-[#3D5A54]">Email Notifications</p>
                <p className="font-sans text-sm text-[#3D5A54]/70">Receive updates via email</p>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors flex items-center",
                settings.emailEnabled ? "bg-[#7BA89A]" : "bg-[#B8D4C0]"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  settings.emailEnabled ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleSetting("pushEnabled")}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                settings.pushEnabled
                  ? "bg-[#E8F2EE] border-[#7BA89A]"
                  : "border-[#E8F2EE] hover:border-[#B8D4C0]"
              )}
            >
              <div className="text-left">
                <p className="font-sans text-base font-medium text-[#3D5A54]">Push Notifications</p>
                <p className="font-sans text-sm text-[#3D5A54]/70">Receive browser notifications</p>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors flex items-center",
                settings.pushEnabled ? "bg-[#7BA89A]" : "bg-[#B8D4C0]"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  settings.pushEnabled ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>
          </div>
        </div>

        <hr className="border-[#E8F2EE]" />

        {/* Notification Types */}
        <div>
          <h3 className="font-serif text-lg text-[#3D5A54] mb-4">Notification Types</h3>
          
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => toggleSetting("appointmentReminders")}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                settings.appointmentReminders
                  ? "bg-[#E8F2EE] border-[#7BA89A]"
                  : "border-[#E8F2EE] hover:border-[#B8D4C0]"
              )}
            >
              <div className="text-left">
                <p className="font-sans text-base font-medium text-[#3D5A54]">Appointment Reminders</p>
                <p className="font-sans text-sm text-[#3D5A54]/70">Get reminded before your sessions</p>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors flex items-center",
                settings.appointmentReminders ? "bg-[#7BA89A]" : "bg-[#B8D4C0]"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  settings.appointmentReminders ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleSetting("messageAlerts")}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                settings.messageAlerts
                  ? "bg-[#E8F2EE] border-[#7BA89A]"
                  : "border-[#E8F2EE] hover:border-[#B8D4C0]"
              )}
            >
              <div className="text-left">
                <p className="font-sans text-base font-medium text-[#3D5A54]">Message Alerts</p>
                <p className="font-sans text-sm text-[#3D5A54]/70">Notify when you receive new messages</p>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors flex items-center",
                settings.messageAlerts ? "bg-[#7BA89A]" : "bg-[#B8D4C0]"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  settings.messageAlerts ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleSetting("weeklyCheckIn")}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                settings.weeklyCheckIn
                  ? "bg-[#E8F2EE] border-[#7BA89A]"
                  : "border-[#E8F2EE] hover:border-[#B8D4C0]"
              )}
            >
              <div className="text-left">
                <p className="font-sans text-base font-medium text-[#3D5A54]">Weekly Check-in Reminders</p>
                <p className="font-sans text-sm text-[#3D5A54]/70">Gentle reminders to check in weekly</p>
              </div>
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors flex items-center",
                settings.weeklyCheckIn ? "bg-[#7BA89A]" : "bg-[#B8D4C0]"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  settings.weeklyCheckIn ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="btn-primary text-base px-6 py-3">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
