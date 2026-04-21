"use client";

import { cn } from "@/utils/cn";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type HTMLAttributes, useRef, useState, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outline";
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  tilt?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, glow = false, tilt = false, interactive = false, padding = "md", children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const cardRef = (ref as any) || internalRef;
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const springConfig = { stiffness: 300, damping: 30 };
    const rotateX = useSpring(useTransform(y, [0, 1], [tilt ? 8 : 0, tilt ? -8 : 0]), springConfig);
    const rotateY = useSpring(useTransform(x, [0, 1], [tilt ? -8 : 0, tilt ? 8 : 0]), springConfig);

    const glareX = useTransform(x, [0, 1], [0, 100]);
    const glareY = useTransform(y, [0, 1], [0, 100]);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!tilt || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      x.set(px);
      y.set(py);
    };

    const handleMouseLeave = () => {
      x.set(0.5);
      y.set(0.5);
      setIsHovered(false);
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const variants = {
      default: "bg-white border-foam shadow-soft",
      glass: "bg-white/70 backdrop-blur-xl border-white/40 shadow-card",
      outline: "bg-transparent border-teal/10 shadow-none",
    };

    const cardContent = (
      <>
        {children}
        {tilt && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden"
            style={{ opacity: isHovered ? 1 : 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([latestX, latestY]) =>
                    `radial-gradient(circle at ${latestX}% ${latestY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
                ),
              }}
            />
          </motion.div>
        )}
      </>
    );

    if (tilt || interactive) {
      const { onDrag, ...safeProps } = props as any;
      return (
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
          whileHover={interactive ? { scale: 1.02, y: -2 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "relative border rounded-[20px]",
            variants[variant],
            hover && "hover:shadow-float",
            glow && "ring-1 ring-[#B8D4C0]",
            paddings[padding],
            className
          )}
          {...safeProps}
        >
          {cardContent}
        </motion.div>
      );
    }

    return (
      <div
        ref={cardRef}
        className={cn(
          "border rounded-[20px]",
          variants[variant],
          hover && "transition-all duration-300 ease-out hover:shadow-float hover:-translate-y-0.5",
          glow && "ring-1 ring-[#B8D4C0]",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

