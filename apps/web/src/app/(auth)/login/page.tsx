"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  email:    z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const setDemoRole = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "demo123", { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // API Template Alignment
      await new Promise((r) => setTimeout(r, 800)); // Make it a bit faster for demo

      const email = data.email.toLowerCase();
      
      // Mock logic for role redirection
      if (email.includes("admin")) {
        window.location.href = "/admin";
      } else if (email.includes("counselor") || email.includes("counsellor")) {
        window.location.href = "/counselor";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
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
            <button type="button" onClick={() => setDemoRole("student@university.edu")} className="px-3 py-1 font-sans text-xs rounded-full bg-[#E8F2EE] text-[#3D5A54] hover:bg-[#7BA89A] hover:text-white transition-all cursor-pointer">
                Student
            </button>
            <button type="button" onClick={() => setDemoRole("counselor@university.edu")} className="px-3 py-1 font-sans text-xs rounded-full bg-[#FEF4E0] text-[#A0700A] hover:bg-[#D4A017] hover:text-white transition-all cursor-pointer">
                Counsellor
            </button>
            <button type="button" onClick={() => setDemoRole("admin@university.edu")} className="px-3 py-1 font-sans text-xs rounded-full bg-[#FDEAEA] text-[#B03030] hover:bg-[#B03030] hover:text-white transition-all cursor-pointer">
                Admin
            </button>
        </div>
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@university.edu"
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
            <Link
              href="/forgot-password"
              className="font-sans text-xs text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
            <p className="font-sans text-sm text-[#B03030]">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full mt-1"
          id="login-submit"
        >
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
        <Link
          href="/register"
          className="font-medium text-[#7BA89A] hover:text-[#5C8A7B] transition-colors"
        >
          Create an account
        </Link>
      </p>

      {/* Role hint */}
      <div className="rounded-xl bg-[#3D5A54] border border-[#3D5A54] px-5 py-5 flex flex-col gap-2 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#7BA89A] animate-pulse" />
                <p className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                    Provider & Staff Access
                </p>
            </div>
            <p className="font-sans text-xs font-normal text-white/80 leading-relaxed mt-2 max-w-[95%]">
                Sign in with your institutional credentials to access the StillMind Decision Support System. You will be securely routed to your designated portal.
            </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7BA89A]/10 rounded-full" />
        <div className="absolute -top-10 -right-2 w-16 h-16 bg-[#E8F2EE]/5 rounded-full" />
      </div>
    </div>
  );
}
