"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface AnimatedHeroProps {
  className?: string;
}

export function AnimatedHero({ className = "" }: AnimatedHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className={`absolute inset-0 bg-[#FCFCFA] ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(123,168,154,0.06)_0%,transparent_50%)]" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base background */}
      <div className="absolute inset-0 bg-[#FCFCFA]" />

      {/* Animated gradient orbs - organic flowing motion */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(123, 168, 154, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          left: "-10%",
          top: "-20%",
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(127, 150, 184, 0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
          right: "-5%",
          top: "10%",
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 60, 30, 0],
          scale: [1, 1.15, 1.08, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(184, 212, 192, 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          left: "30%",
          bottom: "-10%",
        }}
        animate={{
          x: [0, 60, 30, 0],
          y: [0, -40, -20, 0],
          scale: [1, 1.08, 1.04, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />

      {/* Mouse-following subtle gradient */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(123, 168, 154, 0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: mousePosition.x * 100 - 200,
          y: mousePosition.y * 100 - 200,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
          mass: 1,
        }}
      />

      {/* Subtle noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid pattern overlay - very subtle */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(61, 90, 84, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61, 90, 84, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
