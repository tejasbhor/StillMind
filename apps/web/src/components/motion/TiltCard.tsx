"use client";

import { motion } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
