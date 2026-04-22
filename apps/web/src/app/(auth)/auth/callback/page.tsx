"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/auth-store";
import { authApi, tokenStore } from "@/services/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");

    if (access_token) {
      // 1. Store the token
      tokenStore.setAccess(access_token);

      // 2. Fetch user profile to complete the auth state
      const completeAuth = async () => {
        try {
          const user = await authApi.me();
          setAuth(user);
          
          // 3. Redirect based on role
          const ROLE_REDIRECT: Record<string, string> = {
            student:   "/dashboard",
            counselor: "/counselor",
            admin:     "/admin",
          };
          router.push(ROLE_REDIRECT[user.role] ?? "/dashboard");
        } catch (err) {
          console.error("Failed to finalize Google Auth:", err);
          router.push("/login?error=auth_failed");
        }
      };

      completeAuth();
    } else {
      // No token found, redirect back to login
      router.push("/login");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal/10 border-t-teal rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-teal rounded-full animate-ping" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-serif text-2xl text-teal-dark">Authenticating...</h2>
        <p className="font-sans text-sm text-teal/60">Finalizing your secure session with Google</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
