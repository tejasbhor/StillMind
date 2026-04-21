"use client";

import { cn } from "@/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";

/**
 * StillMind Typography System
 * Enforces brand fonts and institutional visual hierarchy.
 */

type TextVariant = "h1" | "h2" | "h3" | "h4" | "body" | "body-lg" | "small" | "tiny" | "lead";

interface TextProps extends Omit<HTMLMotionProps<"p">, "children"> {
  variant?: TextVariant;
  children: ReactNode;
  as?: any;
  gradient?: boolean;
}

const tagMap: Record<TextVariant, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-lg": "p",
  small: "p",
  tiny: "span",
  lead: "p",
};

const variantClasses: Record<TextVariant, string> = {
  h1: "font-serif text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-teal-dark",
  h2: "font-serif text-3xl lg:text-4xl font-normal leading-[1.2] tracking-tight text-teal-dark",
  h3: "font-serif text-2xl lg:text-3xl font-normal leading-snug tracking-tight text-teal-dark",
  h4: "font-sans text-xl lg:text-2xl font-semibold tracking-tight text-teal/80",
  lead: "font-sans text-lg lg:text-xl text-teal/75 leading-relaxed max-w-2xl",
  body: "font-sans text-base text-teal/80 leading-relaxed",
  "body-lg": "font-sans text-lg text-teal/80 leading-relaxed",
  small: "font-sans text-sm text-teal/70 leading-relaxed",
  tiny: "font-sans text-xs uppercase tracking-widest font-semibold text-teal-mid/60",
};

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ variant = "body", children, as, gradient, className, ...props }, ref) => {
    const Component = as || tagMap[variant];
    const MotionComponent = motion(Component);

    return (
      <MotionComponent
        ref={ref}
        className={cn(
          variantClasses[variant],
          gradient && "text-gradient",
          className
        )}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

Text.displayName = "Text";

export const Heading = forwardRef<HTMLElement, TextProps>(
  ({ variant = "h2", ...props }, ref) => (
    <Text ref={ref} variant={variant} {...props} />
  )
);

Heading.displayName = "Heading";

export default Text;
