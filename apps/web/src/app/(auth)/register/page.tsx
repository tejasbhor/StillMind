"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, Lock, Shield, ShieldCheck, User, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { authApi, studentApi } from "@/services/api";
import { useAuthStore } from "@/hooks/auth-store";

type Role = "student" | "counselor" | "admin";
const ROLE_ICONS = {
  student: GraduationCap,
  counselor: User,
  admin: Shield,
} as const;

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    full_name: z.string().trim().min(2, "Full name is required").max(100, "Name is too long"),
    college_id: z.string().trim().min(2, "College ID is required").max(50, "College ID is too long"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\+?[0-9\s()-]{7,20}$/.test(v), "Please enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Za-z]/, "Password must include at least one letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
    dataUsageConsent: z.boolean().refine(Boolean, "Data usage consent is required"),
    counselingConsent: z.boolean().refine(Boolean, "Counseling consent is required"),
    emergencyEscalationConsent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const CONSENTS = [
  { id: "dataUsageConsent", label: "Data usage consent", required: true, description: "I consent to StillMind processing my responses to provide support services." },
  { id: "counselingConsent", label: "Counseling service consent", required: true, description: "I consent to being connected with a counselor and attending scheduled sessions." },
  { id: "emergencyEscalationConsent", label: "Emergency escalation consent", required: false, description: "I consent to escalation to institutional support in urgent situations. (Optional)" },
];

type RegisterData = z.infer<typeof registerSchema>;
const DEMO_STUDENT = {
  email: "student@stillmind.edu",
  password: "student123",
  full_name: "Demo Student",
  college_id: "CS2024001",
  phone: "+91 9876543210",
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      emergencyEscalationConsent: false,
    },
  });

  const handleStudentDemoFill = () => {
    form.setValue("email", DEMO_STUDENT.email, { shouldValidate: true });
    form.setValue("password", DEMO_STUDENT.password, { shouldValidate: true });
    form.setValue("confirmPassword", DEMO_STUDENT.password, { shouldValidate: true });
    form.setValue("full_name", DEMO_STUDENT.full_name, { shouldValidate: true });
    form.setValue("college_id", DEMO_STUDENT.college_id, { shouldValidate: true });
    form.setValue("phone", DEMO_STUDENT.phone, { shouldValidate: true });
    form.setValue("dataUsageConsent", true, { shouldValidate: true });
    form.setValue("counselingConsent", true, { shouldValidate: true });
    form.setValue("emergencyEscalationConsent", true, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      await authApi.registerStudent({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        college_id: data.college_id,
        phone: data.phone,
      });

      await login({ email: data.email, password: data.password });

      await studentApi.submitConsents({
        data_usage: { granted: data.dataUsageConsent },
        counseling: { granted: data.counselingConsent },
        emergency_escalation: { granted: !!data.emergencyEscalationConsent },
      });

      router.push("/dashboard/assessment");
    } catch (e: any) {
      setError(e?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark">
          Create your account.
        </h1>
        <p className="font-sans text-sm text-teal/65">
          Start with your role. Student self-signup is open.
        </p>
      </div>

      {/* Role selection */}
      <div className="grid grid-cols-3 gap-1.5 rounded-full border border-teal/10 bg-[#f7f9f7] p-1">
        {[
          { id: "student", label: "Student" },
          { id: "counselor", label: "Counselor" },
          { id: "admin", label: "Admin" },
        ].map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setSelectedRole(role.id as Role)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all",
              selectedRole === role.id
                ? "bg-teal text-white shadow-soft"
                : "text-teal/60 hover:bg-teal/5"
            )}
          >
            {(() => {
              const Icon = ROLE_ICONS[role.id as Role];
              return <Icon className="h-3.5 w-3.5" />;
            })()}
            {role.label}
          </button>
        ))}
      </div>

      {selectedRole !== "student" ? (
        <div className="rounded-2xl border border-teal/10 bg-white p-5 md:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-teal mt-0.5" />
            <div>
              <h2 className="font-serif text-2xl text-teal-dark">
                Institutional access only
              </h2>
              <p className="font-sans text-sm text-teal/65 mt-1 leading-relaxed">
                Counselor and admin accounts are provisioned by your institution. Use your assigned credentials to sign in.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" size="lg" className="flex-1" onClick={() => router.push("/login")}>
              Sign in
            </Button>
            <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => router.push("/contact")}>
              Contact support
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {error && (
            <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
              <p className="font-sans text-sm text-[#B03030]">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-[-6px]">
            <p className="font-sans text-xs text-teal/60 mr-1">Quick Demo:</p>
            <button
              type="button"
              onClick={handleStudentDemoFill}
              className="px-3 py-1 font-sans text-xs rounded-full bg-[#E8F2EE] text-teal-dark hover:bg-sage hover:text-white transition-all cursor-pointer"
            >
              Prefill student demo
            </button>
          </div>

          <Input
            id="reg-email"
            label="Email address"
            floating={false}
            showFocusLine={false}
            type="email"
            placeholder="you@university.edu"
            autoComplete="email"
            showStatusIcon={false}
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <Input
            id="reg-full-name"
            label="Full name"
            floating={false}
            showFocusLine={false}
            type="text"
            placeholder="Alex Sharma"
            autoComplete="name"
            showStatusIcon={false}
            error={form.formState.errors.full_name?.message}
            {...form.register("full_name")}
          />
          <Input
            id="reg-college-id"
            label="College ID"
            floating={false}
            showFocusLine={false}
            type="text"
            placeholder="e.g. CS2024001"
            hint="Use your institution-issued identifier."
            showStatusIcon={false}
            error={form.formState.errors.college_id?.message}
            {...form.register("college_id")}
          />
          <Input
            id="reg-phone"
            label="Phone (optional)"
            floating={false}
            showFocusLine={false}
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            showStatusIcon={false}
            error={form.formState.errors.phone?.message}
            {...form.register("phone")}
          />

          <Input
            id="reg-password"
            label="Password"
            floating={false}
            showFocusLine={false}
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters with letters and numbers"
            autoComplete="new-password"
            showStatusIcon={false}
            error={form.formState.errors.password?.message}
            className="pr-10"
            {...form.register("password")}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-teal/40 hover:text-teal transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            }
          />
          <Input
            id="reg-confirm-password"
            label="Confirm password"
            floating={false}
            showFocusLine={false}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat your password"
            autoComplete="new-password"
            showStatusIcon={false}
            error={form.formState.errors.confirmPassword?.message}
            className="pr-10"
            {...form.register("confirmPassword")}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="text-teal/40 hover:text-teal transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            }
          />

          <div className="rounded-xl border border-teal/10 bg-[#F8FCFA] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal" />
              <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-teal/60">
                Consent
              </p>
            </div>
            {CONSENTS.map((consent) => (
              <label key={consent.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-teal/20 accent-sage"
                  {...form.register(consent.id as keyof RegisterData)}
                />
                <span className="font-sans text-xs text-teal/70 leading-relaxed">
                  <strong className="text-teal-dark font-semibold">{consent.label}</strong>
                  {consent.required ? " *" : ""} - {consent.description}
                </span>
              </label>
            ))}
            {(form.formState.errors.dataUsageConsent || form.formState.errors.counselingConsent) && (
              <p className="text-xs text-[#B03030]">
                Required consents must be accepted to continue.
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full mt-1 !rounded-full !py-4" loading={loading} id="reg-submit">
            Create student account
          </Button>

          <div className="rounded-xl border border-teal/10 bg-white px-4 py-3 flex items-start gap-2">
            <UserCheck className="h-4 w-4 text-teal mt-0.5" />
            <p className="font-sans text-xs text-teal/65 leading-relaxed">
              After signup, we sign you in automatically and activate your profile with required consents.
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#E8F2EE]" />
            <span className="font-sans text-[10px] uppercase tracking-widest text-teal/30 bg-white px-2">or register with</span>
            <div className="flex-1 h-px bg-[#E8F2EE]" />
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const org = urlParams.get("org") || "";
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/auth/login/google?role=student${org ? `&org=${org}` : ""}`;
            }}
            className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-full border border-teal/10 bg-white hover:bg-teal/[0.02] hover:border-teal/20 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-sans text-sm font-semibold text-teal-dark">Sign up with Google</span>
          </button>

          <p className="text-center font-sans text-sm font-light text-teal/55">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sage hover:text-teal transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

import { Suspense } from "react";

function RegisterContent() {
  return <RegisterPage />;
}

export function RegisterWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
        <p className="font-sans text-sm text-teal/40">Loading registration portal...</p>
      </div>
    }>
      <RegisterPage />
    </Suspense>
  );
}

