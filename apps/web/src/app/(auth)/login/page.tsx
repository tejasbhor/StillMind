"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth-store";

const schema = z.object({
  email:    z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

// Match seed_all.py accounts exactly
const DEMO_ACCOUNTS = [
  { label: "Student",    email: "student@stillmind.edu",   password: "student123" },
  { label: "Counsellor", email: "counselor@stillmind.edu", password: "counselor123" },
  { label: "Admin",      email: "admin@stillmind.edu",     password: "admin123" },
] as const;

const ROLE_REDIRECT: Record<string, string> = {
  student:   "/dashboard",
  counselor: "/counselor",
  admin:     "/admin",
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fillDemo = (email: string, password: string) => {
    setValue("email", email,    { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login({ email: data.email, password: data.password });
      const stored = localStorage.getItem("sm_user");
      const user   = stored ? JSON.parse(stored) : null;
      window.location.href = ROLE_REDIRECT[user?.role] ?? "/dashboard";
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="animate-scale-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Welcome to StillMind.</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/60">
          Sign in to access your dashboard as a student or provider.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

        {/* Quick Demo Login */}
        <div className="flex flex-wrap items-center gap-2 mb-[-8px]">
          <p className="font-sans text-xs text-[#3D5A54]/60 mr-1">Quick Demo:</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => fillDemo(a.email, a.password)}
              className="px-3 py-1 font-sans text-xs rounded-full bg-[#E8F2EE] text-[#3D5A54] hover:bg-[#7BA89A] hover:text-white transition-all cursor-pointer"
            >
              {a.label}
            </button>
          ))}
        </div>

        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@stillmind.edu"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B] transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
            <p className="font-sans text-sm text-[#B03030]">{error}</p>
          </div>
        )}

        <Button type="submit" loading={isLoading} size="lg" className="w-full mt-1" id="login-submit">
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E8F2EE]" />
        <span className="font-sans text-xs text-[#3D5A54]/30">or</span>
        <div className="flex-1 h-px bg-[#E8F2EE]" />
      </div>

      {/* Register link */}
      <p className="text-center font-sans text-sm font-light text-[#3D5A54]/55">
        New to StillMind?{" "}
        <Link href="/register" className="font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors">
          Create an account
        </Link>
      </p>

      {/* Provider hint */}
      <div className="rounded-xl bg-[#3D5A54] border border-[#3D5A54] px-5 py-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7BA89A] animate-pulse" />
            <p className="font-sans text-xs font-bold text-white uppercase tracking-wider">Provider &amp; Staff Access</p>
          </div>
          <p className="font-sans text-xs font-normal text-white/80 leading-relaxed mt-2 max-w-[95%]">
            Sign in with your institutional credentials to access the StillMind Decision Support System.
            You will be securely routed to your designated portal.
          </p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7BA89A]/10 rounded-full" />
        <div className="absolute -top-10 -right-2 w-16 h-16 bg-[#E8F2EE]/5 rounded-full" />
      </div>
    </div>
  );
}
