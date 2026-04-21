"use client";

import { Toaster as Sonner } from "sonner";

/**
 * StillMind Toast Provider
 * Configured to match the institutional, glassmorphic design language.
 */

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-teal-muted group-[.toaster]:border-teal/15 group-[.toaster]:shadow-float group-[.toaster]:rounded-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-teal-muted/70",
          actionButton:
            "group-[.toast]:bg-teal group-[.toast]:text-white group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-teal/5 group-[.toast]:text-teal-muted group-[.toast]:rounded-full",
          success: "group-[.toast]:border-sage/30 group-[.toast]:bg-[#F0F7F3]",
          error: "group-[.toast]:border-red-200 group-[.toast]:bg-[#FFF5F5]",
          warning: "group-[.toast]:border-amber-200 group-[.toast]:bg-[#FFFBF2]",
          info: "group-[.toast]:border-teal/20 group-[.toast]:bg-foam",
        },
      }}
      {...props}
    />
  );
};
