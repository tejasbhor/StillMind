"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  className?: string;
  variant?: "subtle" | "medium" | "strong";
}

export function AnimatedBackground({
  className = "",
  variant = "subtle",
}: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const opacityMap = {
    subtle: 0.04,
    medium: 0.08,
    strong: 0.12,
  };

  const baseOpacity = opacityMap[variant];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient orb 1 - Sage */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(123, 168, 154, ${baseOpacity}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{
          x: ["-10%", "5%", "-10%"],
          y: ["-10%", "15%", "-10%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Gradient orb 2 - Dusk */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full right-0"
        style={{
          background: `radial-gradient(circle, rgba(127, 150, 184, ${baseOpacity * 0.8}) 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{
          x: ["10%", "-5%", "10%"],
          y: ["20%", "-5%", "20%"],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Gradient orb 3 - Mist */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bottom-0 left-1/4"
        style={{
          background: `radial-gradient(circle, rgba(184, 212, 192, ${baseOpacity * 0.6}) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{
          x: ["0%", "10%", "0%"],
          y: ["0%", "-20%", "0%"],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Animated gradient border effect
interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBorder({ children, className = "" }: GradientBorderProps) {
  return (
    <div className={`relative p-[1px] rounded-[20px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #7BA89A, #7F96B8, #B8D4C0, #7BA89A)",
          backgroundSize: "300% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative bg-white rounded-[19px]">{children}</div>
    </div>
  );
}

