"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "stacked" | "iconOnly";
  iconSize?: "sm" | "md" | "lg";
}

export default function Logo({ 
  className = "", 
  variant = "horizontal",
  iconSize = "md"
}: LogoProps) {
  
  const sizeClasses = {
    sm: { icon: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-11 h-11", text: "text-xl" },
    lg: { icon: "w-16 h-16", text: "text-2xl" },
  };

  const currentSize = sizeClasses[iconSize];
  
  // Layout logic
  const isStacked = variant === "stacked";
  const hideText = variant === "iconOnly";
  
  // Brand Colors (Constant)
  const textColor = "#214C46"; // Brand Teal
  const hoverColor = "#4F7F77"; // Sage Teal

  return (
    <Link 
      href="/" 
      className={`group/logo select-none outline-none inline-block ${className}`}
      aria-label="StillMind Home"
    >
      <motion.div 
        className={`flex ${isStacked ? "flex-col items-center gap-1" : "items-center gap-1.5"}`}
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        {/* The Mark */}
        <motion.div 
          variants={{
            rest: { scale: 1, rotate: 0 },
            hover: { scale: 1.05, rotate: 2 }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`${currentSize.icon} relative flex items-center justify-center shrink-0`}
        >
          <Image 
            src="/logo.png" 
            alt="StillMind" 
            width={currentSize.icon.includes("11") ? 44 : 64}
            height={currentSize.icon.includes("11") ? 44 : 64}
            className="object-contain transition-all duration-500"
            priority
          />
        </motion.div>

        {/* The Wordmark */}
        {!hideText && (
          <motion.span 
            variants={{
              rest: { y: 0, color: textColor },
              hover: { y: isStacked ? 1 : 0, x: isStacked ? 0 : 1, color: hoverColor }
            }}
            className={`font-serif ${currentSize.text} font-bold tracking-tighter transition-colors text-center truncate`}
          >
            StillMind
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}
