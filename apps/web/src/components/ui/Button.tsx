"use client";

import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef, useState, useRef, MouseEvent } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "amber" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
}

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, magnetic = true, ripple = true, children, disabled, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const [isPressed, setIsPressed] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    let rippleId = 0;

    const base =
      "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5A54] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#5C8A7B] text-white hover:bg-[#3D5A54] hover:shadow-[0_8px_24px_rgba(61,90,84,0.25)] hover:-translate-y-0.5 active:translate-y-0",
      ghost:
        "bg-transparent text-[#3E5C52] border border-[#B8D4C0] hover:border-[#7BA89A] hover:bg-[#E8F2EE] hover:-translate-y-0.5 active:translate-y-0",
      danger:
        "bg-[#FDEAEA] text-[#B03030] border border-[#F5B8B8] hover:bg-[#F5B8B8] hover:text-white hover:-translate-y-0.5 active:translate-y-0",
      amber:
        "bg-[#FEF4E0] text-[#855C08] border border-[#E8D4B0] hover:bg-[#E8D4B0] hover:text-[#3D5A54] hover:-translate-y-0.5 active:translate-y-0",
      outline:
        "bg-transparent text-[#3D5A54] border border-[#B8D4C0] hover:border-[#3D5A54] hover:bg-[#F5F3EF] hover:-translate-y-0.5 active:translate-y-0",
    };

    const sizes = {
      sm: "text-sm px-4 py-1.5",
      md: "text-[0.9375rem] px-6 py-2.5",
      lg: "text-base px-8 py-3.5",
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now() + rippleId++;

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      onClick?.(e);
    };

    const buttonContent = (
      <>
        {/* Ripple effects */}
        <AnimatePresence>
          {ripple && ripples.map((rippleItem) => (
            <motion.span
              key={rippleItem.id}
              initial={{ scale: 0, opacity: 0.4 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: rippleItem.x,
                top: rippleItem.y,
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                backgroundColor: variant === "primary" ? "rgba(255,255,255,0.3)" : "rgba(123,168,154,0.2)",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Loading spinner */}
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span>Loading…</span>
          </>
        ) : (
          <motion.span
            animate={{ y: isPressed ? 1 : 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </>
    );

    return (
      <motion.div
        whileHover={magnetic && !disabled ? { scale: 1.02 } : {}}
        whileTap={magnetic && !disabled ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="inline-block"
      >
        <button
          ref={ref}
          disabled={disabled || loading}
          onClick={handleClick}
          onPointerDown={() => setIsPressed(true)}
          onPointerUp={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          className={cn(base, variants[variant], sizes[size], "transition-all duration-300 ease-out", className)}
          {...props}
        >
          {buttonContent}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = "Button";
export default Button;

