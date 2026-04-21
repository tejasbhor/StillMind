"use client";

import { cn } from "@/utils/cn";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useState } from "react";

/**
 * StillMind Avatar Component
 * Built on Radix UI for accessibility.
 */

interface AvatarProps extends AvatarPrimitive.AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "away" | "busy" | "offline";
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const statusClasses: Record<string, string> = {
  online: "bg-sage border-white",
  away: "bg-[#FEF4E0] border-white",
  busy: "bg-[#B03030] border-white",
  offline: "bg-teal-muted border-white",
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", status, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-teal/10 bg-foam shadow-soft",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <AnimatePresence>
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            onLoadingStatusChange={(status) => {
              if (status === "loaded") setIsLoaded(true);
            }}
            asChild
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.1 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              className="aspect-square h-full w-full object-cover"
            />
          </AvatarPrimitive.Image>
        </AnimatePresence>

        <AvatarPrimitive.Fallback
          asChild
          delayMs={600}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full w-full items-center justify-center rounded-full bg-teal-light/20 font-sans font-medium text-teal-mid"
          >
            {fallback || (alt ? alt.substring(0, 2).toUpperCase() : "?")}
          </motion.span>
        </AvatarPrimitive.Fallback>

        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-[25%] w-[25%] rounded-full border-2",
              statusClasses[status]
            )}
            aria-hidden="true"
          />
        )}
      </AvatarPrimitive.Root>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
