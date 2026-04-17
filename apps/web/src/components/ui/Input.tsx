"use client";

import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { type InputHTMLAttributes, forwardRef, useState, useEffect } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  floating?: boolean;
  shakeOnError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, floating = true, shakeOnError = true, value, defaultValue, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
    const [shakeTrigger, setShakeTrigger] = useState(0);

    const isFloating = floating && label && (isFocused || hasValue);

    // Trigger shake when error appears
    useEffect(() => {
      if (error && shakeOnError) {
        setShakeTrigger((prev) => prev + 1);
      }
    }, [error, shakeOnError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    return (
      <motion.div
        className="flex flex-col gap-1.5 relative"
        animate={shakeTrigger > 0 && error ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        key={shakeTrigger}
      >
        <div className="relative">
          {/* Floating Label */}
          {floating && label && (
            <motion.label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 font-sans font-medium pointer-events-none origin-left transition-colors",
                isFocused ? "text-[#5C8A7B]" : "text-[#5C7A73]"
              )}
              animate={{
                y: isFloating ? -10 : 12,
                scale: isFloating ? 0.8 : 1,
                color: isFocused ? "#5C8A7B" : error ? "#B03030" : "#5C7A73",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {label}
            </motion.label>
          )}

          {/* Static Label (non-floating) */}
          {!floating && label && (
            <label
              htmlFor={inputId}
              className="font-sans text-sm font-medium text-[#3D5A54] mb-1.5 block"
            >
              {label}
            </label>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            className={cn(
              "w-full rounded-xl border bg-white font-sans text-[0.9375rem] text-[#3D5A54] placeholder:text-[#5C7A73]/50",
              "transition-all duration-200 outline-none focus:scale-[1.005]",
              floating && label ? "pt-5 pb-2.5 px-4" : "px-4 py-2.5",
              "focus:border-[#5C8A7B] focus:ring-4 focus:ring-[#5C8A7B]/10",
              error
                ? "border-[#F5B8B8] focus:border-[#B03030] focus:ring-[#B03030]/10"
                : "border-[#B8D4C0] hover:border-[#9DBFB3]",
              className
            )}
            {...props}
          />

          {/* Focus indicator line */}
          <motion.div
            className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#5C8A7B] rounded-full pointer-events-none"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: isFocused ? 1 : 0,
              opacity: isFocused ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Success checkmark */}
          <AnimatePresence>
            {!error && hasValue && isFocused === false && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C8A7B]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <motion.path
                  d="M5 12l5 5L20 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Error icon */}
          <AnimatePresence>
            {error && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B03030]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Hint / Error messages */}
        <AnimatePresence mode="wait">
          {hint && !error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="font-sans text-xs text-[#3D5A8B] flex items-center gap-1"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {hint}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 4, height: 0 }}
              className="font-sans text-xs text-[#B03030] flex items-center gap-1"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Input.displayName = "Input";
export default Input;

