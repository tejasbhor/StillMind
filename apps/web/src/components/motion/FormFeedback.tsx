"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface ShakeProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export function Shake({ children, trigger, className = "" }: ShakeProps) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -8, 8, -8, 8, 0],
              transition: { duration: 0.4, ease: "easeInOut" },
            }
          : {}
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Success checkmark animation
interface SuccessCheckProps {
  show: boolean;
  className?: string;
  size?: number;
}

export function SuccessCheck({ show, className = "", size = 24 }: SuccessCheckProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
        >
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="#5C8A7B"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <motion.path
            d="M8 12l3 3 5-6"
            stroke="#5C8A7B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

// Error shake with icon
interface ErrorShakeProps {
  children: ReactNode;
  error?: string;
  className?: string;
}

export function ErrorShake({ children, error, className = "" }: ErrorShakeProps) {
  return (
    <motion.div
      animate={
        error
          ? {
              x: [0, -6, 6, -4, 4, 0],
              transition: { duration: 0.35, ease: "easeInOut" },
            }
          : {}
      }
      className={className}
    >
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="font-sans text-xs text-[#B03030] mt-1.5 flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Loading spinner with pulse
interface LoadingPulseProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
}

export function LoadingPulse({ loading, children, className = "" }: LoadingPulseProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={
          loading
            ? {
                opacity: [1, 0.5, 1],
                scale: [1, 0.98, 1],
              }
            : {}
        }
        transition={{
          duration: 1.2,
          repeat: loading ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-[inherit]"
        >
          <motion.div
            className="w-6 h-6 border-2 border-[#5C8A7B] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </div>
  );
}

// Floating label input animation
interface FloatingLabelProps {
  label: string;
  value: string;
  focused: boolean;
  children: ReactNode;
  className?: string;
}

export function FloatingLabel({
  label,
  value,
  focused,
  children,
  className = "",
}: FloatingLabelProps) {
  const isActive = focused || value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <motion.label
        animate={{
          y: isActive ? -24 : 12,
          scale: isActive ? 0.85 : 1,
          color: focused ? "#5C8A7B" : "#5C7A73",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-4 font-sans text-sm font-medium pointer-events-none origin-left"
      >
        {label}
      </motion.label>
      {children}
    </div>
  );
}
