"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { forwardRef } from "react";

/**
 * StillMind Spinner
 * A premium, institutional loading indicator.
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "teal" | "white" | "sage";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
  xl: "h-16 w-16 border-4",
};

const variantClasses: Record<string, string> = {
  teal: "border-teal/20 border-t-teal",
  white: "border-white/30 border-t-white",
  sage: "border-sage/20 border-t-sage",
};

export const Spinner = ({ size = "md", variant = "teal", className }: SpinnerProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        "inline-block rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * StillMind LoadingState
 * Legacy compatibility component for dashboard and portal views.
 */
interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingState({ size = "md", text, className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
      <Spinner size={size} variant="teal" />
      {text && (
        <p className="font-sans text-sm text-teal-mid/60 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * StillMind Skeleton
 * Premium shimmering skeleton for content placement.
 */
interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
  height?: string;
}

export const Skeleton = ({ className, variant = "rect", height }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "skeleton bg-foam/80",
        variant === "circle" ? "rounded-full" : variant === "text" ? "rounded-md h-4 w-full" : "rounded-lg",
        height,
        className
      )}
      aria-hidden="true"
    />
  );
};

export function SkeletonCard() {
  return (
    <div className="bg-white/80 rounded-[20px] border border-teal/5 p-6 space-y-4 backdrop-blur-sm">
      <Skeleton variant="text" className="w-1/3 h-6" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="w-24 h-10 rounded-full" />
        <Skeleton className="w-24 h-10 rounded-full" />
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default LoadingState;
