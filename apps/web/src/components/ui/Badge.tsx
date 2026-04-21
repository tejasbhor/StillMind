"use client";

import { cn } from "@/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

/**
 * StillMind Badge Component
 * Used for status indicators, risk levels, and categories.
 */

export interface BadgeProps extends Omit<HTMLMotionProps<"span">, "children"> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline" | "ghost";
  size?: "sm" | "md";
  dot?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: "bg-teal/10 text-teal-mid border border-teal/10",
  secondary: "bg-sage/10 text-sage-text border border-sage/10",
  success: "bg-foam text-sage-text border border-mist",
  warning: "bg-[#FEF4E0] text-[#855C08] border border-[#E8D4B0]",
  danger: "bg-[#FDEAEA] text-[#B03030] border border-[#F5B8B8]",
  outline: "bg-transparent text-teal-muted border border-teal/20",
  ghost: "bg-white/40 backdrop-blur-sm text-teal-muted border border-white/30 shadow-soft",
};

const dotClasses: Record<string, string> = {
  primary: "bg-teal",
  secondary: "bg-sage",
  success: "bg-[#214C46]",
  warning: "bg-[#A0700A]",
  danger: "bg-[#B03030]",
  outline: "bg-teal-light",
  ghost: "bg-teal-mid",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", size = "md", dot, className, children, ...props }, ref) => {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "inline-flex items-center gap-1.5 font-sans font-medium rounded-full",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-[0.81250rem]",
          variantClasses[variant] || variantClasses.primary,
          className
        )}
        {...props}
      >
        {dot && (
          <span 
            className={cn("h-1.5 w-1.5 rounded-full", dotClasses[variant] || dotClasses.primary)} 
            aria-hidden="true" 
          />
        )}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
