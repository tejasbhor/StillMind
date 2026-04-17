"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, ReactNode, MouseEvent } from "react";

interface RippleProps {
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

export function Ripple({
  children,
  className = "",
  color = "rgba(255, 255, 255, 0.3)",
  duration = 600,
}: RippleProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  let rippleId = 0;

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleId++;

    setRipples((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration);
  }, [duration]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              borderRadius: "50%",
              backgroundColor: color,
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
      {children}
    </div>
  );
}

// Button wrapper with ripple
interface RippleButtonProps extends RippleProps {
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

export function RippleButton({
  children,
  onClick,
  disabled,
  ...rippleProps
}: RippleButtonProps) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <Ripple {...rippleProps}>
      <div
        onClick={handleClick}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      >
        {children}
      </div>
    </Ripple>
  );
}
