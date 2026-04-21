"use client";

import { cn } from "@/utils/cn";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

/**
 * StillMind Alert Component
 * Clean, status-driven messaging.
 */

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
}

const alertVariants = {
  info: "bg-teal/5 text-teal-mid border-teal/15",
  success: "bg-[#E8F2EE] text-[#3D5A54] border-[#B8D4C0]",
  warning: "bg-[#FEF4E0] text-[#855C08] border-[#E8D4B0]",
  danger: "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]",
};

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", className, children, ...props }, ref) => {
    const Icon = alertIcons[variant];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative w-full rounded-2xl border p-4 flex gap-3",
          alertVariants[variant],
          className
        )}
        role="alert"
        {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-[0.9375rem] font-sans leading-relaxed">{children}</div>
      </motion.div>
    );
  }
);
Alert.displayName = "Alert";

/**
 * StillMind Progress Component
 */

export const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-teal/10",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-teal transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * StillMind Meter Component
 * Specifically for wellness indicators.
 */

interface MeterProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export const Meter = ({ value, max = 100, label, className }: MeterProps) => {
  const percentage = (value / max) * 100;
  
  // Color logic based on "Institutional Trust" palette
  const getColor = () => {
    if (percentage < 33) return "bg-red-400";
    if (percentage < 66) return "bg-amber-400";
    return "bg-sage";
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center text-xs font-sans font-semibold uppercase tracking-wider text-teal-mid/60">
        <span>{label}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-teal/5 border border-teal/5 p-0.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className={cn("h-full rounded-full shadow-inner", getColor())}
        />
      </div>
    </div>
  );
};
