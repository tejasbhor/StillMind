"use client";

import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, Shield, ShieldCheck, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/auth-store";

const schema = z.object({
  email:    z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

type Role = "student" | "counselor" | "admin";

const DEMO_ACCOUNTS = [
  { role: "student" as const, label: "Student", email: "student@stillmind.edu", password: "student123" },
  { role: "counselor" as const, label: "Counselor", email: "counselor@stillmind.edu", password: "counselor123" },
  { role: "admin" as const, label: "Admin", email: "admin@stillmind.edu", password: "admin123" },
] as const;
const ROLE_ICONS = {
  student: GraduationCap,
  counselor: User,
  admin: Shield,
} as const;

const ROLE_REDIRECT: Record<string, string> = {
  student:   "/dashboard",
  counselor: "/counselor",
  admin:     "/admin",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [is2FA, setIs2FA] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempName, setTempName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, verifyLogin, isLoading } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fillDemo = (email: string, password: string, role: Role) => {
    setSelectedRole(role);
    setValue("email", email,    { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await login({ email: data.email, password: data.password });
      
      if (result.requires_2fa) {
        setIs2FA(true);
        setTempEmail(data.email);
        setTempName(result.full_name || "User");
        return;
      }

      const stored = localStorage.getItem("sm_user");
      const user   = stored ? JSON.parse(stored) : null;
      if (user?.role && user.role !== selectedRole) {
        setError(
          `This account is registered as ${user.role}. Redirecting you to the correct portal.`
        );
      }
      router.push(ROLE_REDIRECT[user?.role] ?? "/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password. Please try again.");
    }
  };

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setError(null);
    try {
      await verifyLogin(tempEmail, verificationCode);
      const stored = localStorage.getItem("sm_user");
      const user = stored ? JSON.parse(stored) : null;
      
      if (user?.role && user.role !== selectedRole) {
        // Log mismatch but proceed to correct dashboard
        console.warn(`Account role (${user.role}) differs from selection (${selectedRole}). Redirecting to correct portal.`);
      }
      
      router.push(ROLE_REDIRECT[user?.role] ?? "/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Invalid verification code.");
    }
  };

  const roleOptions = useMemo(
    () =>
      ([
        { id: "student", label: "Student" },
        { id: "counselor", label: "Counselor" },
        { id: "admin", label: "Admin" },
      ] as const),
    []
  );

  if (is2FA) {
    return (
      <div className="animate-scale-in flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark">
            Verify identity, {tempName}.
          </h1>
          <p className="font-sans text-sm text-teal/65">
            We've sent a 6-digit verification code to <strong>{tempEmail}</strong>.
          </p>
        </div>

        <form onSubmit={onVerifySubmit} className="flex flex-col gap-5">
          <Input
            id="login-verify-code"
            label="Verification Code"
            floating={false}
            showFocusLine={false}
            placeholder="123456"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
            showStatusIcon={false}
          />

          {error && (
            <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
              <p className="font-sans text-sm text-[#B03030]">{error}</p>
            </div>
          )}

          <Button type="submit" loading={isLoading} size="lg" className="w-full mt-1 !rounded-full !py-4">
            Verify & Sign In
          </Button>

          <button
            type="button"
            onClick={() => setIs2FA(false)}
            className="font-sans text-xs text-center text-teal/50 hover:text-teal transition-colors"
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-scale-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark">
          Welcome back.
        </h1>
        <p className="font-sans text-sm text-teal/65">
          Choose your role and sign in to continue.
        </p>
      </div>

      {expired && (
        <div className="rounded-xl border border-[#E8D4B0] bg-[#FEF4E0] px-4 py-3">
          <p className="font-sans text-sm text-[#855C08]">
            Your session expired. Please sign in again.
          </p>
        </div>
      )}

      {/* Role picker */}
      <div className="grid grid-cols-3 gap-1.5 rounded-full border border-teal/10 bg-[#f7f9f7] p-1">
        {roleOptions.map((r) => {
          const Icon = ROLE_ICONS[r.id];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all ${
                selectedRole === r.id
                  ? "bg-teal text-white shadow-soft"
                  : "text-teal/60 hover:bg-teal/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Quick Demo Login */}
        <div className="flex flex-wrap items-center gap-2 mb-[-6px]">
          <p className="font-sans text-xs text-teal/60 mr-1">Quick Demo:</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => fillDemo(a.email, a.password, a.role)}
              className="px-3 py-1 font-sans text-xs rounded-full bg-[#E8F2EE] text-teal-dark hover:bg-sage hover:text-white transition-all cursor-pointer"
            >
              {a.label}
            </button>
          ))}
        </div>

        <Input
          id="login-email"
          label="Email address"
          floating={false}
          showFocusLine={false}
          type="email"
          placeholder="you@stillmind.edu"
          autoComplete="email"
          showStatusIcon={false}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            id="login-password"
            label="Password"
            floating={false}
            showFocusLine={false}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            showStatusIcon={false}
            error={errors.password?.message}
            className="pr-10"
            {...register("password")}
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
          <div className="flex justify-end">
            <Link href="/forgot-password" className="font-sans text-xs text-sage hover:text-teal transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
            <p className="font-sans text-sm text-[#B03030]">{error}</p>
          </div>
        )}

        <Button type="submit" loading={isLoading} size="lg" className="w-full mt-1 !rounded-full !py-4" id="login-submit">
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E8F2EE]" />
        <span className="font-sans text-[10px] uppercase tracking-widest text-teal/30 bg-white px-2">or continue with</span>
        <div className="flex-1 h-px bg-[#E8F2EE]" />
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={() => {
          const org = searchParams.get("org") || "";
          const role = selectedRole || "student";
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/auth/login/google?role=${role}${org ? `&org=${org}` : ""}`;
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
        <span className="font-sans text-sm font-semibold text-teal-dark">Sign in with Google</span>
      </button>

      {/* Register link */}
      <p className="text-center font-sans text-sm font-light text-teal/55">
        New to StillMind?{" "}
        <Link href="/register" className="font-semibold text-sage hover:text-teal transition-colors">
          Create an account
        </Link>
      </p>

      {/* Provider hint */}
      <div className="rounded-2xl border border-teal/10 bg-[#f4faf7] px-5 py-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-teal mt-0.5 shrink-0" />
        <p className="font-sans text-xs text-teal/70 leading-relaxed">
          Provider and admin access uses institutional accounts. You will be routed to the correct workspace after authentication.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
        <p className="font-sans text-sm text-teal/40">Loading secure portal...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

