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
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: wire to POST /api/v1/auth/login
      await new Promise((r) => setTimeout(r, 1200));
      // Redirect based on role — for now demo redirect
      window.location.href = "/dashboard";
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
        <h1 className="font-serif text-3xl text-[#3D5A54]">Welcome back.</h1>
        <p className="font-sans font-light text-sm text-[#3D5A54]/55">
          Sign in to your StillMind account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
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
      <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
        <p className="font-sans text-xs font-light text-[#3D5A54]/70 text-center leading-relaxed">
          Counsellor or admin? Use the same sign-in — you'll be redirected to your correct dashboard.
        </p>
      </div>
    </div>
  );
}
