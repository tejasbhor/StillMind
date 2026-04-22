"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/services/api";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-scale-in flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-[#E8F2EE] p-4">
            <CheckCircle className="h-8 w-8 text-teal" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl tracking-tight text-teal-dark">
              Check your email
            </h1>
            <p className="mt-2 font-sans text-sm text-teal/65 max-w-xs">
              We&apos;ve sent a password reset link to your email address.
              Please check your inbox and follow the instructions.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8D4B0] bg-[#FEF4E0] px-4 py-3">
          <p className="font-sans text-sm text-[#855C08]">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 font-sans text-sm text-sage hover:text-teal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-scale-in flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark">
          Forgot password?
        </h1>
        <p className="font-sans text-sm text-teal/65">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
          <p className="font-sans text-sm text-[#B03030]">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          id="forgot-email"
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

        <Button
          type="submit"
          loading={isLoading}
          size="lg"
          className="w-full mt-1 !rounded-full !py-4"
        >
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 font-sans text-sm text-sage hover:text-teal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  );
}
