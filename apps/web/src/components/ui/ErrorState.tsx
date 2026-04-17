"use client";

import { cn } from "@/utils/cn";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-8 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#FDEAEA] flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-[#B03030]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.16 17c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="font-serif text-lg text-[#3D5A54] mb-1">{title}</h3>
      <p className="font-sans text-sm text-[#3D5A54]/60 mb-4 max-w-xs">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-sans text-sm font-medium px-4 py-2 rounded-lg bg-[#3D5A54] text-white hover:bg-[#4E7268] transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface OfflineStateProps {
  className?: string;
}

export function OfflineState({ className }: OfflineStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 px-6 text-center bg-[#FEF4E0] rounded-xl border border-[#E8D4B0]",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#FEF4E0] flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-[#A0700A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m4.243 4.243L21 21"
          />
        </svg>
      </div>
      <p className="font-sans text-sm font-medium text-[#855C08]">
        You&apos;re offline
      </p>
      <p className="font-sans text-xs text-[#A0700A]/70 mt-1">
        Check your internet connection
      </p>
    </div>
  );
}
