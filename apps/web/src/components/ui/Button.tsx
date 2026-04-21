"use client";

import { cn } from "@/utils/cn";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { forwardRef, useState, useRef, MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * StillMind Premium Button
 * Features: Magnetic motion, variable ripple, and glassmorphic variants.
 * Adheres to WCAG 2.2 AA.
 */

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "ghost" | "danger" | "amber" | "outline" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  children: ReactNode;
}

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, magnetic = true, ripple = true, children, disabled, onClick, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const [isPressed, setIsPressed] = useState(false);
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as any) || internalRef;
    
    const nextRippleId = useRef(0);

    const base =
      "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300";

    const variantClasses = {
      primary: "bg-teal text-white hover:bg-teal-mid hover:shadow-soft active:translate-y-0",
      ghost: "bg-transparent text-teal-mid border border-teal/20 hover:border-teal/40 hover:bg-teal/5 active:translate-y-0",
      danger: "bg-[#FDEAEA] text-[#B03030] border border-[#F5B8B8] hover:bg-[#B03030] hover:text-white active:translate-y-0",
      amber: "bg-[#FEF4E0] text-[#855C08] border border-[#E8D4B0] hover:bg-[#855C08] hover:text-white active:translate-y-0",
      outline: "bg-transparent text-teal-muted border border-teal/30 hover:border-teal hover:bg-foam/30 active:translate-y-0",
      glass: "glass text-teal-mid hover:shadow-card hover:bg-white/60 active:translate-y-0",
    };

    const sizeClasses = {
      sm: "text-sm px-4 py-1.5",
      md: "text-[0.9375rem] px-7 py-2.5",
      lg: "text-base px-9 py-3.5",
      icon: "p-2 h-10 w-10",
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      const shouldRipple = ripple && !prefersReducedMotion && !disabled && !loading;
      if (shouldRipple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now() + nextRippleId.current++;

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={buttonRef}
        disabled={disabled || loading}
        onClick={handleClick}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        whileHover={
          magnetic && !prefersReducedMotion && !disabled ? { scale: 1.015, y: -2 } : {}
        }
        whileTap={
          magnetic && !prefersReducedMotion && !disabled ? { scale: 0.985, y: 0 } : {}
        }
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={cn(base, variantClasses[variant], sizeClasses[size], className)}
        role="button"
        aria-disabled={disabled || loading}
        {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripple && !prefersReducedMotion && ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: r.x,
                top: r.y,
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                backgroundColor: variant === "primary" ? "rgba(255,255,255,0.4)" : "rgba(33,76,70,0.15)",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Button Content */}
        {loading ? (
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
