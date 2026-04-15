"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/cn";

// ── Zod schemas per step ───────────────────────────────────────────────────────
const step1Schema = z.object({
  email:           z.string().email("Valid email required"),
  password:        z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  full_name:  z.string().min(2, "Full name required"),
  college_id: z.string().min(2, "College ID required"),
  phone:      z.string().optional(),
});

const CONSENTS = [
  { id: "data_usage_consent",        label: "Data usage consent",              required: true,  description: "I consent to StillMind processing my responses to provide mental health support services." },
  { id: "counseling_consent",        label: "Counselling service consent",     required: true,  description: "I consent to being connected with a counsellor and attending scheduled sessions." },
  { id: "emergency_escalation_consent", label: "Emergency escalation consent", required: false, description: "I consent to my counsellor escalating my case to an administrator if an urgent risk is identified. (Optional)" },
];

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const STEP_LABELS = ["Account", "Profile", "Consent"];

export default function RegisterPage() {
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  const toggleConsent = (id: string) =>
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));

  const requiredConsentsGiven = CONSENTS.filter((c) => c.required).every(
    (c) => consents[c.id]
  );

  const onStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };
  const onStep2 = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };
  const onSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      window.location.href = "/dashboard/assessment";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Create your account.</h1>
        <p className="font-sans font-light text-sm text-[#3D5A54]/55">
          Step {step} of 3 — {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const active   = s === step;
          const complete = s < step;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-sans transition-all duration-300",
                    complete ? "bg-[#7BA89A] text-white" : "",
                    active   ? "bg-[#3D5A54] text-white" : "",
                    !active && !complete ? "bg-[#E8F2EE] text-[#3D5A54]/40 border border-[#B8D4C0]" : ""
                  )}
                >
                  {complete ? "✓" : s}
                </div>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px transition-all duration-500",
                    complete ? "bg-[#7BA89A]" : "bg-[#E8F2EE]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Account ── */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)} className="flex flex-col gap-5" noValidate>
          <Input
            id="reg-email"
            label="Email address"
            type="email"
            placeholder="you@university.edu"
            error={form1.formState.errors.email?.message}
            {...form1.register("email")}
          />
          <Input
            id="reg-password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            hint="Use a mix of letters, numbers and symbols."
            error={form1.formState.errors.password?.message}
            {...form1.register("password")}
          />
          <Input
            id="reg-confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            error={form1.formState.errors.confirmPassword?.message}
            {...form1.register("confirmPassword")}
          />
          <Button type="submit" size="lg" className="w-full mt-2" id="reg-step1-next">
            Continue
          </Button>
          <p className="text-center font-sans text-sm font-light text-[#3D5A54]/55">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* ── Step 2: Profile ── */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2)} className="flex flex-col gap-5" noValidate>
          <Input
            id="reg-full-name"
            label="Full name"
            type="text"
            placeholder="Alex Sharma"
            error={form2.formState.errors.full_name?.message}
            {...form2.register("full_name")}
          />
          <Input
            id="reg-college-id"
            label="College ID"
            type="text"
            placeholder="e.g. CS2024001"
            hint="This is your student ID from your institution."
            error={form2.formState.errors.college_id?.message}
            {...form2.register("college_id")}
          />
          <Input
            id="reg-phone"
            label="Phone (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            {...form2.register("phone")}
          />
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1" id="reg-step2-next">
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* ── Step 3: Consent ── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
            <p className="font-sans text-xs font-light text-[#3D5A54]/70 leading-relaxed">
              Before we begin, we need your consent to process your information. Please read each statement carefully.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {CONSENTS.map((consent) => (
              <label
                key={consent.id}
                htmlFor={`consent-${consent.id}`}
                className={cn(
                  "flex gap-3 rounded-xl border p-4 cursor-none transition-all duration-200",
                  consents[consent.id]
                    ? "border-[#7BA89A] bg-[#E8F2EE]"
                    : "border-[#E8F2EE] bg-white hover:border-[#B8D4C0]"
                )}
              >
                <input
                  id={`consent-${consent.id}`}
                  type="checkbox"
                  checked={!!consents[consent.id]}
                  onChange={() => toggleConsent(consent.id)}
                  className="mt-0.5 h-4 w-4 rounded border-[#B8D4C0] accent-[#7BA89A] flex-shrink-0"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-sm font-medium text-[#3D5A54]">
                    {consent.label}
                    {consent.required && <span className="ml-1 text-[#B03030]">*</span>}
                  </span>
                  <span className="font-sans text-xs font-light text-[#3D5A54]/60 leading-relaxed">
                    {consent.description}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              id="reg-submit"
              loading={loading}
              disabled={!requiredConsentsGiven}
              onClick={onSubmit}
            >
              Create account
            </Button>
          </div>

          <p className="font-sans text-xs font-light text-center text-[#3D5A54]/40 leading-relaxed">
            Required fields marked with *. You may withdraw non-required consents at any time.
          </p>
        </div>
      )}
    </div>
  );
}
