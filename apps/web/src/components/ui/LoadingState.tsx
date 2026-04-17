"use client";

import { cn } from "@/utils/cn";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
};

const dotSizes = {
  sm: "w-1 h-1",
  md: "w-1.5 h-1.5",
  lg: "w-2 h-2",
};

export function LoadingState({
  size = "md",
  text,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-full border-[#B8D4C0]",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full border-[#7BA89A]",
            sizeClasses[size],
            "animate-spin"
          )}
          style={{
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
          }}
        />
      </div>
      {text && (
        <p className="font-sans text-sm text-[#3D5A54]/60 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  height?: string;
}

export function Skeleton({ className, height = "h-4" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#E8F2EE] rounded-lg",
        height,
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E8F2EE] p-6 space-y-4">
      <Skeleton height="h-6" className="w-1/3" />
      <Skeleton height="h-4" />
      <Skeleton height="h-4" className="w-2/3" />
      <div className="flex gap-3 pt-2">
        <Skeleton height="h-10" className="w-24" />
        <Skeleton height="h-10" className="w-24" />
      </div>
    </div>
  );
}
