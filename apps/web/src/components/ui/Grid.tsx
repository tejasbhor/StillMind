"use client";

import { cn } from "@/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

/**
 * StillMind Layout & Grid System
 * Enforces the breathable, institutional white-space philosophy.
 */

interface ContainerProps extends HTMLMotionProps<"div"> {
  size?: "sm" | "md" | "6xl" | "lg" | "xl" | "full";
}

const containerSizes: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  "6xl": "max-w-6xl",
  lg: "max-w-7xl",
  xl: "max-w-[1440px]",
  full: "max-w-full",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "lg", className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn("mx-auto px-6 lg:px-12 w-full", containerSizes[size], className)}
      {...props}
    />
  )
);

Container.displayName = "Container";

interface SectionProps extends HTMLMotionProps<"section"> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
}

const sectionSpacings: Record<string, string> = {
  none: "py-0",
  sm: "py-8 lg:py-12",
  md: "py-12 lg:py-20",
  lg: "py-20 lg:py-32",
  xl: "py-32 lg:py-48",
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ spacing = "md", className, ...props }, ref) => (
    <motion.section
      ref={ref}
      className={cn("relative w-full overflow-hidden", sectionSpacings[spacing], className)}
      {...props}
    />
  )
);

Section.displayName = "Section";

interface GridProps extends HTMLMotionProps<"div"> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 2 | 4 | 6 | 8 | 10 | 12 | 16;
}

const gridCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const smCols: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const mdCols: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const lgCols: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const xlCols: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
};

const gridGaps: Record<number, string> = {
  0: "gap-0",
  2: "gap-2",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, sm, md, lg, xl, gap = 8, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        "grid",
        gridCols[cols],
        sm && smCols[sm],
        md && mdCols[md],
        lg && lgCols[lg],
        xl && xlCols[xl],
        gridGaps[gap],
        className
      )}
      {...props}
    />
  )
);

Grid.displayName = "Grid";
