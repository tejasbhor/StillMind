"use client";

import { cn } from "@/utils/cn";
import * as LabelPrimitive from "@radix-ui/react-label";
import { motion } from "framer-motion";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

/**
 * StillMind Label Component
 * Built on Radix for accessibility.
 */

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none font-sans text-teal-muted/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));

Label.displayName = "Label";

/**
 * StillMind Input Component
 * Premium glassmorphic text input.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-teal/15 bg-white/50 px-4 py-2 text-base font-sans ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-teal-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          "hover:border-teal/30 hover:bg-white/70",
          "backdrop-blur-sm",
          error && "border-red-400 focus-visible:ring-red-400",
          className
        )}
        ref={ref}
        {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
      />
    );
  }
);

Input.displayName = "Input";

/**
 * StillMind Textarea Component
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <motion.textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-teal/15 bg-white/50 px-4 py-3 text-base font-sans ring-offset-white placeholder:text-teal-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-mid focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          "hover:border-teal/30 hover:bg-white/70",
          "backdrop-blur-sm",
          error && "border-red-400 focus-visible:ring-red-400",
          className
        )}
        ref={ref}
        {...Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith("onAnimation")))}
      />
    );
  }
);

Textarea.displayName = "Textarea";
