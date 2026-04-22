"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/services/api";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

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

  // If no token in URL, show error
  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link. Please request a new password reset.");
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError("No reset token found. Please request a new password reset.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setIsSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to reset password. The link may have expired.");
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
              Password reset successful
            </h1>
            <p className="mt-2 font-sans text-sm text-teal/65 max-w-xs">
              Your password has been reset. You will be redirected to the login page shortly.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 font-sans text-sm text-sage hover:text-teal transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-scale-in flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-teal-dark">
          Reset password
        </h1>
        <p className="font-sans text-sm text-teal/65">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] px-4 py-3">
          <p className="font-sans text-sm text-[#B03030]">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Input
          id="password"
          label="New password"
          floating={false}
          showFocusLine={false}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          showStatusIcon={false}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          floating={false}
          showFocusLine={false}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          showStatusIcon={false}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          loading={isLoading}
          size="lg"
          className="w-full mt-1 !rounded-full !py-4"
          disabled={!token}
        >
          Reset password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-6"><h1 className="font-serif text-3xl">Loading...</h1></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
